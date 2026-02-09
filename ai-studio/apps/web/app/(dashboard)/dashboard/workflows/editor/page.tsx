"use client";

import { useCallback, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Play, Download, Upload } from 'lucide-react';
import {
    LoadModelNode,
    PromptNode,
    SamplerNode,
    OutputNode,
    LoRANode,
    UpscaleNode,
    LoadImageNode,
    ControlNetNode,
    EmptyLatentImageNode,
    VAEEncodeNode,
    VAEDecodeNode,
    FaceSwapNode,
    InpaintNode
} from '@/components/workflow/CustomNodes';

const nodeTypes = {
    loadModel: LoadModelNode,
    prompt: PromptNode,
    sampler: SamplerNode,
    output: OutputNode,
    lora: LoRANode,
    upscale: UpscaleNode,
    loadImage: LoadImageNode,
    controlNet: ControlNetNode,
    emptyLatent: EmptyLatentImageNode,
    vaeEncode: VAEEncodeNode,
    vaeDecode: VAEDecodeNode,
    faceSwap: FaceSwapNode,
    inpaint: InpaintNode
};

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'loadModel',
        position: { x: 50, y: 100 },
        data: { label: 'Load Checkpoint' }
    },
    {
        id: '2',
        type: 'prompt',
        position: { x: 50, y: 250 },
        data: { label: 'Prompt' }
    },
    {
        id: '3',
        type: 'sampler',
        position: { x: 350, y: 150 },
        data: { label: 'Sampler' }
    },
    {
        id: '4',
        type: 'output',
        position: { x: 650, y: 175 },
        data: { label: 'Output' }
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-3', source: '1', target: '3', animated: true },
    { id: 'e2-3', source: '2', target: '3', animated: true },
    { id: 'e3-4', source: '3', target: '4', animated: true },
];

export default function WorkflowEditor() {
    const searchParams = useSearchParams();
    const workflowId = searchParams.get('id');
    const router = useRouter();

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [workflowName, setWorkflowName] = useState('Untitled Workflow');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (workflowId) {
            loadWorkflow(workflowId);
        }
    }, [workflowId]);

    const loadWorkflow = async (id: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/workflows/${id}`);
            const data = await response.json();
            if (data.workflow) {
                setWorkflowName(data.workflow.name);
                setNodes(data.workflow.nodes || []);
                setEdges(data.workflow.edges || []);
            }
        } catch (error) {
            console.error("Failed to load workflow:", error);
            alert("Failed to load workflow");
        } finally {
            setLoading(false);
        }
    };

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges]
    );

    const addNode = (type: string) => {
        const newNode: Node = {
            id: `${Date.now()}`,
            type,
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: type }
        };
        setNodes((nds) => [...nds, newNode]);
    };

    const saveWorkflow = async () => {
        try {
            const workflow = {
                name: workflowName,
                description: 'Created in AI Studio',
                nodes,
                edges,
            };

            const url = workflowId ? `/api/workflows/${workflowId}` : '/api/workflows';
            const method = workflowId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workflow)
            });

            if (!response.ok) throw new Error('Failed to save workflow');

            const data = await response.json();

            if (!workflowId && data.workflow?.id) {
                // If we just created it, update URL so future saves are updates
                router.replace(`/dashboard/workflows/editor?id=${data.workflow.id}`);
            }

            alert('Workflow saved successfully!');
        } catch (error) {
            console.error('Save error:', error);
            alert('Error saving workflow. Please check console.');
        }
    };

    const runWorkflow = async () => {
        try {
            setLoading(true);

            // 1. Find Prompt Node
            const promptNode = nodes.find(n => n.type === 'prompt');
            if (!promptNode) {
                setLoading(false);
                return alert("Please add a Prompt node!");
            }

            // 2. Find Sampler Node (optional)
            const samplerNode = nodes.find(n => n.type === 'sampler');

            // 3. Find Load Image Node (for Img2Img)
            const imageNode = nodes.find(n => n.type === 'loadImage');

            // 4. Find ControlNet Node
            const controlNetNode = nodes.find(n => n.type === 'controlNet');

            // 5. Find Load Model Node
            const modelNode = nodes.find(n => n.type === 'loadModel');

            // 6. Extract Data
            const promptText = promptNode.data?.prompt || "A masterpiece";
            const steps = samplerNode?.data?.steps || 20;
            const cfg = samplerNode?.data?.cfg || 7.5;
            const sourceImage = imageNode?.data?.image;
            const controlModel = controlNetNode?.data?.model;
            // Default to SDXL if no model selected or node active
            const selectedModel = modelNode?.data?.model;

            // 7. Call API
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: promptText,
                    num_inference_steps: steps,
                    guidance_scale: cfg,
                    image: sourceImage,
                    model: selectedModel, // Send selected model
                    controlnet: controlModel ? {
                        model: controlModel,
                        strength: controlNetNode?.data?.strength || 1.0
                    } : undefined
                })
            });

            const data = await response.json();

            if (data.success && data.images?.[0]) {
                // Update Output Node with image
                setNodes(nds => nds.map(node => {
                    if (node.type === 'output') {
                        return {
                            ...node,
                            data: { ...node.data, image: data.images[0] }
                        };
                    }
                    return node;
                }));
                // toast.success('Generation Complete!');
            } else {
                alert('Generation Failed: ' + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error(error);
            alert('Execution Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 64px)', overflow: 'hidden', background: '#09090b', position: 'relative' }}>

            {/* Floating Top Toolbar */}
            <div style={{
                position: 'absolute',
                top: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                background: 'rgba(20, 20, 25, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={() => router.push('/dashboard/workflows')}
                        style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'transparent',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            border: 'none',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                    >
                        ←
                    </button>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
                    <input
                        type="text"
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 600,
                            outline: 'none',
                            width: '200px'
                        }}
                    />
                </div>

                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={saveWorkflow}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        <Save size={14} />
                        Save
                    </button>
                    <button
                        onClick={runWorkflow}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
                        }}
                    >
                        {loading ? <div className="animate-spin">⌛</div> : <Play size={14} fill="white" />}
                        Queue Prompt
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', height: '100%' }}>
                {/* Left Node Sidebar */}
                <div style={{
                    width: '260px',
                    background: '#18181b', // Lighter dark for better separation
                    borderRight: '1px solid #27272a',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 5
                }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #27272a' }}>
                        <h3 style={{ color: 'white', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Node Library
                        </h3>
                    </div>

                    <div style={{ padding: '12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { type: 'loadModel', label: 'Load Checkpoint', color: '#818cf8', desc: 'Models & VAE' }, // Brighter Indigo
                            { type: 'prompt', label: 'CLIP Text Encode', color: '#c084fc', desc: 'Prompts' },       // Brighter Purple
                            { type: 'loadImage', label: 'Load Image', color: '#fbbf24', desc: 'Img2Img / Mask' },   // Amber
                            { type: 'controlNet', label: 'Apply ControlNet', color: '#34d399', desc: 'Canny / Depth' }, // Emerald
                            { type: 'sampler', label: 'KSampler', color: '#f87171', desc: 'Sampling' },             // Red
                            { type: 'lora', label: 'Load LoRA', color: '#fbbf24', desc: 'Adjustments' },
                            { type: 'upscale', label: 'Image Upscale', color: '#38bdf8', desc: 'Post-processing' }, // Sky
                            { type: 'output', label: 'Save Image', color: '#4ade80', desc: 'Output' },              // Green
                            { type: 'emptyLatent', label: 'Empty Latent', color: '#ec4899', desc: 'Resolution' },
                            { type: 'vaeEncode', label: 'VAE Encode', color: '#ef4444', desc: 'Pixels to Latent' },
                            { type: 'vaeDecode', label: 'VAE Decode', color: '#ef4444', desc: 'Latent to Pixels' },
                            { type: 'faceSwap', label: 'Face Swap', color: '#8b5cf6', desc: 'Reactor' },
                            { type: 'inpaint', label: 'Inpaint', color: '#f59e0b', desc: 'Masking' },
                        ].map((node) => (
                            <button
                                key={node.type}
                                onClick={() => addNode(node.type)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    background: '#27272a', // Zinc 800 - distinct from sidebar
                                    color: 'white',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#3f3f46'; // Lighter on hover
                                    e.currentTarget.style.borderColor = node.color;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#27272a';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                }}
                            >
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '2px',
                                    background: node.color,
                                    boxShadow: `0 0 8px ${node.color}40`
                                }} />
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{node.label}</div>
                                    <div style={{ fontSize: '11px', color: '#a1a1aa' }}>{node.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ReactFlow Canvas */}
                <div style={{ flex: 1, height: '100%', position: 'relative' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                        style={{ background: '#09090b' }}
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background color="#3f3f46" gap={20} size={1} /> {/* Lighter grid dots */}
                        <Controls
                            style={{
                                background: '#27272a',
                                border: '1px solid #3f3f46',
                                borderRadius: '8px',
                                color: 'white',
                                fill: 'white'
                            }}
                            showInteractive={false}
                        />
                        <MiniMap
                            nodeColor={(n) => {
                                const colors: any = { loadModel: '#6366f1', prompt: '#a855f7', sampler: '#ef4444', output: '#22c55e' };
                                return colors[n.type || ''] || '#71717a';
                            }}
                            maskColor="rgba(9, 9, 11, 0.8)"
                            style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                        />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
}
