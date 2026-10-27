
import { useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './App.css';

const pipeline = [
  {
    id: 'kafka',
    position: { x: 40, y: 120 },
    data: {
      label: 'Kafka',
      subtitle: 'Transaction ingestion',
      status: 'Healthy',
      detail: 'ecommerce-transactions',
    },
    style: { background: '#e8f3ff', border: '1px solid #6ba7e8', borderRadius: 12, padding: 14, width: 205 },
  },
  {
    id: 'flink',
    position: { x: 320, y: 120 },
    data: {
      label: 'Quality Processor',
      subtitle: 'Validation & anomaly checks',
      status: 'Prototype',
      detail: 'Python consumer • quarantine',
    },
    style: { background: '#fff4d9', border: '1px solid #e6b94e', borderRadius: 12, padding: 14, width: 225 },
  },
  {
    id: 'iceberg',
    position: { x: 625, y: 120 },
    data: {
      label: 'Apache Iceberg',
      subtitle: 'Lakehouse storage',
      status: 'Verified',
      detail: 'ecommerce.transactions',
    },
    style: { background: '#e5f7eb', border: '1px solid #65b985', borderRadius: 12, padding: 14, width: 215 },
  },
  {
    id: 'dashboard',
    position: { x: 920, y: 120 },
    data: {
      label: 'Observability',
      subtitle: 'Monitoring dashboard',
      status: 'Active UI',
      detail: 'Pipeline health & alerts',
    },
    style: { background: '#f0eaff', border: '1px solid #a28be8', borderRadius: 12, padding: 14, width: 205 },
  },
];

const edges = [
  { id: 'kafka-flink', source: 'kafka', target: 'flink', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'flink-iceberg', source: 'flink', target: 'iceberg', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'iceberg-dashboard', source: 'iceberg', target: 'dashboard', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
];

function PipelineCard({ data }) {
  return (
    <div className="pipeline-card">
      <div className="pipeline-card-title">{data.label}</div>
      <div className="pipeline-subtitle">{data.subtitle}</div>
      <div className="pipeline-status">Status: {data.status}</div>
      <div className="pipeline-detail">{data.detail}</div>
    </div>
  );
}

export default function App() {
  const [stats, setStats] = useState({
    valid_transactions: null,
    quarantined_transactions: null,
  });
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/stats');

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const data = await response.json();

        if (active) {
          setStats(data);
          setApiConnected(true);
        }
      } catch (error) {
        if (active) {
          setApiConnected(false);
          console.error('Failed to fetch IceStream stats:', error);
        }
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 5000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const nodes = useMemo(
    () =>
      pipeline.map((node) => ({
        ...node,
        type: 'default',
        data: {
          ...node.data,
          label: <PipelineCard data={node.data} />,
        },
      })),
    []
  );

  const validCount = stats.valid_transactions;
  const quarantineCount = stats.quarantined_transactions;

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">DATA ARCHITECTURE & RELIABILITY</p>
          <h1>IceStream Observability</h1>
          <p className="header-description">
            Real-time lakehouse pipeline health and data-quality monitoring
          </p>
        </div>
        <div className="project-pill">
          <span className="live-dot" />
          {apiConnected ? 'API Connected' : 'Connecting to API…'}
        </div>
      </header>

      <section className="metrics-grid">
        <article className="metric-card">
          <span className="metric-label">Validated records</span>
          <strong>{validCount === null ? '—' : validCount}</strong>
          <span className="metric-note">Records in valid transactions file</span>
        </article>

        <article className="metric-card">
          <span className="metric-label">Quarantined records</span>
          <strong>{quarantineCount === null ? '—' : quarantineCount}</strong>
          <span className="metric-note">Records in quarantine file</span>
        </article>

        <article className="metric-card">
          <span className="metric-label">Iceberg snapshot</span>
          <strong className="snapshot-number">Created</strong>
          <span className="metric-note">Latest commit previously verified</span>
        </article>

        <article className="metric-card">
          <span className="metric-label">Pipeline status</span>
          <strong className="status-text">Prototype</strong>
          <span className="metric-note">Full Flink integration pending</span>
        </article>
      </section>

      <section className="panel pipeline-panel">
        <div className="panel-heading">
          <div>
            <h2>Pipeline lineage</h2>
            <p>Follow transaction data from ingestion to lakehouse storage.</p>
          </div>
          <span className="status-chip">4 components</span>
        </div>

        <div className="flow-canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            fitViewOptions={{ padding: 0.16 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>
      </section>

      <section className="bottom-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Data-quality rules</h2>
              <p>Checks performed by the current Python prototype.</p>
            </div>
          </div>

          <ul className="rule-list">
            <li><span className="rule-check">✓</span><span>Required transaction fields present</span></li>
            <li><span className="rule-check">✓</span><span>Tax amount is not NULL</span></li>
            <li><span className="rule-check">✓</span><span>Amount and tax are numeric and non-negative</span></li>
            <li><span className="rule-check">✓</span><span>Unexpected schema fields are quarantined</span></li>
          </ul>
        </article>

        <article className="panel alert-panel">
          <div className="panel-heading">
            <div>
              <h2>Quarantine alerts</h2>
              <p>Records currently in the quarantine file.</p>
            </div>
            <span className="alert-badge">
              {quarantineCount === null ? 'Loading…' : `${quarantineCount} records`}
            </span>
          </div>

          <div className="alert-row">
            <div className="alert-icon">!</div>
            <div>
              <strong>NULL tax amount</strong>
              <p>Transactions with missing tax values are rejected by the quality checks.</p>
            </div>
          </div>

          <div className="alert-row">
            <div className="alert-icon">!</div>
            <div>
              <strong>Unexpected schema field</strong>
              <p>Records containing unsupported fields are quarantined.</p>
            </div>
          </div>
        </article>
      </section>

      <footer className="dashboard-footer">
        IceStream • Local dashboard • Counts refresh every 5 seconds from the Python API.
        {apiConnected ? ' API connection is active.' : ' Waiting for the API connection.'}
      </footer>
    </main>
  );
}
