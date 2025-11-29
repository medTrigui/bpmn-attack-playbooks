import React, { useState, useEffect, useCallback } from 'react';
import './AttackHeatmap.css';
import { attackAPI } from '../services/apiService';

const formatPercentage = (value) =>
  typeof value === 'number' && !Number.isNaN(value) ? `${value.toFixed(0)}%` : '0%';

const classifyHeatLevel = (percentage) => {
  if (percentage >= 66) return 'heat-high';
  if (percentage >= 33) return 'heat-medium';
  if (percentage > 0) return 'heat-low';
  return 'heat-none';
};

const AttackHeatmap = ({ modeler, playbookId }) => {
  const [tactics, setTactics] = useState([]);
  const [coverage, setCoverage] = useState(null);
  const [techniques, setTechniques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    attackAPI
      .getTactics()
      .then((data) => {
        if (!cancelled) {
          setTactics(data.tactics || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load tactics', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const extractTechniquesFromDiagram = useCallback(() => {
    if (!modeler) return [];
    try {
      const registry = modeler.get('elementRegistry');
      const elements = registry.getAll ? registry.getAll() : [];
      const ids = new Set();

      elements.forEach((element) => {
        if (!element || !element.type || !element.type.includes('Task')) return;
        const attr = element.businessObject?.$attrs?.['attack:techniques'];
        if (!attr) return;
        attr
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
          .forEach((id) => ids.add(id));
      });

      return Array.from(ids);
    } catch (err) {
      console.error('Failed to extract techniques from BPMN model', err);
      return [];
    }
  }, [modeler]);

  const refreshHeatmap = useCallback(async () => {
    if (!modeler) {
      setError('BPMN diagram not ready');
      return;
    }

    const techniqueIds = extractTechniquesFromDiagram();
    setTechniques(techniqueIds);

    if (techniqueIds.length === 0) {
      setCoverage(null);
      setLastUpdated(new Date());
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await attackAPI.calculateCoverage(techniqueIds);
      setCoverage(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to calculate ATT&CK coverage', err);
      setError('Unable to calculate coverage for the current diagram');
    } finally {
      setLoading(false);
    }
  }, [modeler, extractTechniquesFromDiagram]);

  useEffect(() => {
    if (modeler) {
      refreshHeatmap();
    }
  }, [modeler, playbookId, refreshHeatmap]);

  const renderTacticCard = (tactic) => {
    const shortName = tactic.x_mitre_shortname || tactic.short_name;
    const tacticCoverage = coverage?.coverage_by_tactic?.[shortName] || {
      total: 0,
      covered: 0,
      percentage: 0,
      covered_techniques: [],
    };

    const sortedTechniques = tacticCoverage.covered_techniques
      ? [...tacticCoverage.covered_techniques].sort((a, b) => {
          const aUsed = techniques.includes(a);
          const bUsed = techniques.includes(b);
          if (aUsed === bUsed) return a.localeCompare(b);
          return aUsed ? -1 : 1;
        })
      : [];

    const isExpanded = expanded.has(shortName);

    return (
      <div
        key={tactic.id}
        className={`heatmap-card ${classifyHeatLevel(tacticCoverage.percentage)}`}
      >
        <div
          className="tactic-header"
          onClick={() => {
            const next = new Set(expanded);
            if (next.has(shortName)) {
              next.delete(shortName);
            } else {
              next.add(shortName);
            }
            setExpanded(next);
          }}
        >
          <span className="tactic-name">{tactic.name}</span>
          <span className="tactic-id">{tactic.id}</span>
        </div>
        <div className="tactic-metrics">
          <div className="metric-value">{formatPercentage(tacticCoverage.percentage)}</div>
          <div className="metric-subtitle">
            {tacticCoverage.covered}/{tacticCoverage.total || '—'} techniques
          </div>
        </div>
        {sortedTechniques.length > 0 && (
          <div className={`tactic-techniques ${isExpanded ? 'expanded' : ''}`}>
            {sortedTechniques.map((techId) => (
              <span
                key={techId}
                className={`technique-chip ${techniques.includes(techId) ? 'active-tech' : ''}`}
              >
                {techId}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const sortedTactics = [...tactics].sort((a, b) => {
    const aShort = a.x_mitre_shortname || a.short_name;
    const bShort = b.x_mitre_shortname || b.short_name;
    const aCovered = (coverage?.coverage_by_tactic?.[aShort]?.covered || 0) > 0;
    const bCovered = (coverage?.coverage_by_tactic?.[bShort]?.covered || 0) > 0;
    if (aCovered === bCovered) {
      const aPerc = coverage?.coverage_by_tactic?.[aShort]?.percentage || 0;
      const bPerc = coverage?.coverage_by_tactic?.[bShort]?.percentage || 0;
      return bPerc - aPerc;
    }
    return aCovered ? -1 : 1;
  });

  return (
    <div className="attack-heatmap">
      <div className="heatmap-header">
        <div>
          <h3>ATT&CK Coverage</h3>
          <p>Visualize which MITRE ATT&CK tactics your playbook addresses.</p>
        </div>
        <div className="heatmap-actions">
          {lastUpdated && (
            <span className="timestamp">Updated {lastUpdated.toLocaleTimeString()}</span>
          )}
          <button className="btn btn-outline" onClick={refreshHeatmap} disabled={loading || !modeler}>
            {loading ? 'Calculating…' : 'Refresh'}
          </button>
        </div>
      </div>

      {!modeler && <div className="heatmap-empty">Load a playbook to view coverage.</div>}

      {modeler && techniques.length === 0 && !loading && (
        <div className="heatmap-empty">
          <p>No ATT&CK techniques mapped yet.</p>
          <small>Select a task and map techniques using the ATT&CK tab.</small>
        </div>
      )}

      {error && <div className="heatmap-error">{error}</div>}

      {coverage && (
        <>
          <div className="heatmap-summary">
            <div className="summary-card">
              <span className="summary-label">Mapped Techniques</span>
              <span className="summary-value">{techniques.length}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Overall Coverage</span>
              <span className="summary-value">
                {formatPercentage(coverage.coverage_percentage)}
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Tactics Covered</span>
              <span className="summary-value">
                {Object.values(coverage.coverage_by_tactic || {}).filter((t) => t.covered > 0).length}
              </span>
            </div>
          </div>

          <div className="heatmap-grid">
            {sortedTactics.map((tactic) => renderTacticCard(tactic))}
          </div>
        </>
      )}
    </div>
  );
};

export default AttackHeatmap;



