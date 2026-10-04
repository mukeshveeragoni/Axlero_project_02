import { useCallback, useEffect, useState } from 'react';

import './App.css';

import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import PipelineNode from './nodes/PipelineNode';


/* =====================================================
   INITIAL NODES
===================================================== */

const initialNodes = [
  {
    id: 'kafka',
    type: 'pipeline',
    position: { x: 50, y: 250 },

    data: {
      category: 'INGEST',
      label: 'Kafka',
      status: 'HEALTHY',
      description: 'Receives and ingests real-time data streams.',
    },
  },

  {
    id: 'flink',
    type: 'pipeline',
    position: { x: 340, y: 250 },

    data: {
      category: 'PROCESS',
      label: 'Flink',
      status: 'HEALTHY',
      description: 'Processes and transforms streaming data.',
    },
  },

  {
    id: 'postgres',
    type: 'pipeline',
    position: { x: 630, y: 250 },

    data: {
      category: 'STORE',
      label: 'PostgreSQL',
      status: 'HEALTHY',
      description: 'Stores processed data in the database.',
    },
  },

  {
    id: 'api',
    type: 'pipeline',
    position: { x: 920, y: 250 },

    data: {
      category: 'SERVE',
      label: 'API',
      status: 'HEALTHY',
      description: 'Provides processed data through APIs.',
    },
  },

  {
    id: 'dashboard',
    type: 'pipeline',
    position: { x: 1210, y: 250 },

    data: {
      category: 'VISUALIZE',
      label: 'Dashboard',
      status: 'READY',
      description: 'Displays real-time pipeline information.',
    },
  },
];


/* =====================================================
   INITIAL EDGES
===================================================== */

const initialEdges = [
  {
    id: 'kafka-flink',
    source: 'kafka',
    target: 'flink',
    animated: true,
  },

  {
    id: 'flink-postgres',
    source: 'flink',
    target: 'postgres',
    animated: true,
  },

  {
    id: 'postgres-api',
    source: 'postgres',
    target: 'api',
    animated: true,
  },

  {
    id: 'api-dashboard',
    source: 'api',
    target: 'dashboard',
    animated: true,
  },
];


/* =====================================================
   NODE TYPES
===================================================== */

const nodeTypes = {
  pipeline: PipelineNode,
};


/* =====================================================
   APP
===================================================== */

function App() {

  const [nodes, setNodes, onNodesChange] =
    useNodesState(initialNodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState(initialEdges);


  /* ===================================================
     SELECTED NODE
  =================================================== */

  const [selectedNode, setSelectedNode] =
    useState(null);


  /* ===================================================
     LAST UPDATED
  =================================================== */

  const [lastUpdated, setLastUpdated] =
    useState(new Date());


  /* ===================================================
     STEP 15
     AUTOMATIC LAST UPDATED TIME
  =================================================== */

  useEffect(() => {

    const timer = setInterval(() => {

      setLastUpdated(new Date());

    }, 5000);


    return () => {

      clearInterval(timer);

    };

  }, []);


  /* ===================================================
     CONNECT NODES
  =================================================== */

  const onConnect = useCallback(
    (connection) => {

      setEdges((currentEdges) => [

        ...currentEdges,

        {
          ...connection,
          animated: true,
        },

      ]);

    },
    [setEdges]
  );


  /* ===================================================
     NODE CLICK
  =================================================== */

  const onNodeClick = useCallback(
    (_event, node) => {

      setSelectedNode(node);

    },
    []
  );


  /* ===================================================
     CLOSE DETAILS PANEL
  =================================================== */

  const closeDetails = () => {

    setSelectedNode(null);

  };


  /* ===================================================
     CHANGE STATUS
  =================================================== */

  const changeStatus = (status) => {

    if (!selectedNode) {

      return;

    }


    /* Update node inside React Flow */

    setNodes((currentNodes) => {

      return currentNodes.map((node) => {

        if (node.id !== selectedNode.id) {

          return node;

        }


        return {

          ...node,

          data: {

            ...node.data,

            status: status,

          },

        };

      });

    });


    /* Update selected node */

    setSelectedNode((currentNode) => {

      if (!currentNode) {

        return null;

      }


      return {

        ...currentNode,

        data: {

          ...currentNode.data,

          status: status,

        },

      };

    });


    /* Update time immediately */

    setLastUpdated(new Date());

  };


  /* ===================================================
     REFRESH
  =================================================== */

  const handleRefresh = () => {

    setLastUpdated(new Date());

  };


  /* ===================================================
     OVERALL STATUS
  =================================================== */

  const overallStatus =

    nodes.some(
      (node) => node.data.status === 'ERROR'
    )

      ? 'ERROR'

      : nodes.some(
          (node) => node.data.status === 'WARNING'
        )

        ? 'WARNING'

        : 'HEALTHY';


  /* ===================================================
     TIME FORMAT
  =================================================== */

  const formattedTime =

    lastUpdated.toLocaleTimeString([], {

      hour: '2-digit',

      minute: '2-digit',

      second: '2-digit',

      hour12: false,

    });


  /* ===================================================
     RETURN
  =================================================== */

  return (

    <div className="app">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="header">


        {/* LEFT */}

        <div className="header-left">

          <h1>
            Data Lineage
          </h1>

          <p>
            Real-time pipeline monitoring
          </p>

        </div>


        {/* RIGHT */}

        <div className="header-right">


          {/* STATUS */}

          <div className="stat-card">

            <span className="stat-title">
              STATUS
            </span>


            <span

              className={
                overallStatus === 'HEALTHY'

                  ? 'stat-value healthy'

                  : 'stat-value'
              }

              style={{

                color:

                  overallStatus === 'ERROR'

                    ? '#ff4757'

                    : overallStatus === 'WARNING'

                      ? '#ffc107'

                      : '#20e77a',

              }}

            >

              <span

                className="status-dot"

                style={{

                  background:

                    overallStatus === 'ERROR'

                      ? '#ff4757'

                      : overallStatus === 'WARNING'

                        ? '#ffc107'

                        : '#20e77a',

                }}

              />

              {overallStatus}

            </span>

          </div>


          {/* NODES */}

          <div className="stat-card">

            <span className="stat-title">
              NODES
            </span>

            <span className="stat-value">

              {nodes.length}

            </span>

          </div>


          {/* CONNECTIONS */}

          <div className="stat-card">

            <span className="stat-title">
              CONNECTIONS
            </span>

            <span className="stat-value">

              {edges.length}

            </span>

          </div>


          {/* LAST UPDATED */}

          <div className="stat-card">

            <span className="stat-title">
              LAST UPDATED
            </span>

            <span className="stat-value">

              {formattedTime}

            </span>

          </div>


          {/* REFRESH */}

          <button

            className="refresh-button"

            onClick={handleRefresh}

          >

            ↻ Refresh

          </button>

        </div>

      </header>


      {/* =================================================
          FLOW
      ================================================= */}

      <main className="flow-container">


        <ReactFlow

          nodes={nodes}

          edges={edges}

          onNodesChange={onNodesChange}

          onEdgesChange={onEdgesChange}

          onConnect={onConnect}

          onNodeClick={onNodeClick}

          nodeTypes={nodeTypes}

          fitView

          fitViewOptions={{

            padding: 0.2,

          }}

        >

          <Background

            gap={20}

            size={1}

            color="#333846"

          />

          <Controls />

        </ReactFlow>


        {/* =================================================
            DETAILS PANEL
        ================================================= */}

        {selectedNode && (

          <div className="node-details">


            {/* CLOSE */}

            <button

              className="close-button"

              onClick={closeDetails}

            >

              ×

            </button>


            {/* CATEGORY */}

            <div className="details-category">

              {selectedNode.data.category}

            </div>


            {/* TITLE */}

            <h2>

              {selectedNode.data.label}

            </h2>


            {/* STATUS */}

            <p className="details-status">

              Status:

              <strong

                style={{

                  color:

                    selectedNode.data.status === 'ERROR'

                      ? '#ff4757'

                      : selectedNode.data.status === 'WARNING'

                        ? '#ffc107'

                        : selectedNode.data.status === 'READY'

                          ? '#8f9bb3'

                          : '#20e77a',

                }}

              >

                {selectedNode.data.status}

              </strong>

            </p>


            {/* DESCRIPTION */}

            <p className="details-description">

              {selectedNode.data.description}

            </p>


            {/* DIVIDER */}

            <div className="details-divider"></div>


            {/* =================================================
                STATUS BUTTONS
            ================================================= */}

            <div className="status-section">

              <h3>
                Change Status
              </h3>


              {/* HEALTHY */}

              <button

                className="status-button healthy-button"

                onClick={() =>
                  changeStatus('HEALTHY')
                }

              >

                <span className="status-button-dot healthy-dot"></span>

                Healthy

              </button>


              {/* WARNING */}

              <button

                className="status-button warning-button"

                onClick={() =>
                  changeStatus('WARNING')
                }

              >

                <span className="status-button-dot warning-dot"></span>

                Warning

              </button>


              {/* ERROR */}

              <button

                className="status-button error-button"

                onClick={() =>
                  changeStatus('ERROR')
                }

              >

                <span className="status-button-dot error-dot"></span>

                Error

              </button>

            </div>


            {/* DIVIDER */}

            <div className="details-divider"></div>


            {/* =================================================
                NODE INFORMATION
            ================================================= */}

            <div className="details-row">

              <span>
                NODE ID
              </span>

              <strong>

                {selectedNode.id}

              </strong>

            </div>


            <div className="details-row">

              <span>
                POSITION
              </span>

              <strong>

                X: {Math.round(selectedNode.position.x)}

                <br />

                Y: {Math.round(selectedNode.position.y)}

              </strong>

            </div>


          </div>

        )}

      </main>

    </div>

  );

}


export default App;