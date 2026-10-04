import { Handle, Position } from '@xyflow/react';

function PipelineNode({ data }) {

  // Get color based on current status
  const getStatusColor = () => {
    if (data.status === 'HEALTHY') {
      return '#20e77a';
    }

    if (data.status === 'WARNING') {
      return '#ffc107';
    }

    if (data.status === 'ERROR') {
      return '#ff4757';
    }

    if (data.status === 'READY') {
      return '#8f9bb3';
    }

    return '#64748b';
  };

  const statusColor = getStatusColor();

  return (
    <div
      style={{
        width: '230px',
        minHeight: '140px',

        background: '#ffffff',

        border: `2px solid ${statusColor}`,

        borderRadius: '18px',

        padding: '22px',

        textAlign: 'center',

        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',

        color: '#374151',

        transition: 'all 0.2s ease',

        boxSizing: 'border-box',
      }}
    >

      {/* =========================
          INPUT HANDLE
      ========================= */}

      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: '8px',
          height: '8px',
          background: '#202040',
          border: 'none',
        }}
      />

      {/* =========================
          CATEGORY
      ========================= */}

      <div
        style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#64748b',
          letterSpacing: '1px',
          marginBottom: '12px',
        }}
      >
        {data.category}
      </div>

      {/* =========================
          NODE NAME
      ========================= */}

      <div
        style={{
          fontSize: '23px',
          fontWeight: '500',
          color: '#64748b',
          marginBottom: '14px',
          lineHeight: '1.2',
        }}
      >
        {data.label}
      </div>

      {/* =========================
          STATUS
      ========================= */}

      <div
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: statusColor,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: statusColor,
            marginRight: '6px',
            verticalAlign: 'middle',
          }}
        />

        {data.status}
      </div>

      {/* =========================
          OUTPUT HANDLE
      ========================= */}

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: '8px',
          height: '8px',
          background: '#202040',
          border: 'none',
        }}
      />

    </div>
  );
}

export default PipelineNode;