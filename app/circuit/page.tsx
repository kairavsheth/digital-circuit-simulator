"use client";
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactFlow, {
    addEdge,
    Background,
    BackgroundVariant,
    Connection,
    Controls,
    Edge, getOutgoers,
    MiniMap, Node, ReactFlowProvider, updateEdge,
    useEdgesState,
    useNodesState
} from 'reactflow';
import {v4} from "uuid"

import 'reactflow/dist/style.css';
import Input from "@/app/circuit/components/nodes/input";
import Output from "@/app/circuit/components/nodes/output";
import Gate from "@/app/circuit/components/nodes/gate";

interface GateType {
    id: string;
    color:string;
    name: string;
    inputs?: string[];
    outputs: { [key: string]: string };
    circuit?: { gates: GateType[], wires: Wire[] };
}

interface Wire {
    source: string;
    target: string;
}

const GateList: GateType[] = [{
    id: '1',
    name: 'AND',
    color:'#267AB2',
    inputs: ['a', 'b'],
    outputs: {out: 'a && b'},
}, {
    id: '2',
    name: 'OR',
    color:'#0D6E52',
    inputs: ['x', 'y'],
    outputs: {out: 'x || y'},
}, {
    id: '3',
    name: 'NOT',
    color:'#8C1F1A',
    inputs: ['a'],
    outputs: {out: '!a'},
}];


const proOptions = {hideAttribution: true};


function CircuitMaker() {
    const reactFlowWrapper = useRef(null);

    const edgeUpdateSuccessful = useRef(true);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [inputValues, setInputValues] = useState<{ [key: string]: boolean }>({});
    const [outputValues, setOutputValues] = useState<{ [key: string]: boolean }>({});
    const [ioLabelInput, setIoLabelInput] = useState('')

    const nodeTypes = useMemo(() => {
        return {
            ip: Input,
            op: Output,
            gate: Gate
        }
    }, []);

    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onEdgeUpdateStart = useCallback(() => {
        edgeUpdateSuccessful.current = false;
    }, []);

    const onEdgeUpdate = useCallback((oldEdge: Edge, newConnection: Connection) => {
        edgeUpdateSuccessful.current = true;
        setEdges((els) => updateEdge(oldEdge, newConnection, els));
    }, [setEdges]);

    const onEdgeUpdateEnd = useCallback((_: any, edge: Edge) => {
        if (!edgeUpdateSuccessful.current) {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        }

        edgeUpdateSuccessful.current = true;
    }, [setEdges]);


    const onDragOver = useCallback((event: any) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: any) => {
            event.preventDefault();

            try {
                const {type, data} = JSON.parse(event.dataTransfer.getData('application/reactflow'))
                if (typeof type === 'undefined' || !type) {
                    return;
                }
                if (type === 'ip' || type === 'op') {
                    if (!ioLabelInput) {
                        alert('Please enter a label for the input/output');
                        return;
                    }
                    if (nodes.some(node => node.data.label === ioLabelInput)) {
                        alert('Label already exists');
                        return;
                    }
                }
                const position = reactFlowInstance?.screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                });
                const newNode = {
                    id: v4(),
                    type,
                    position,
                    data,
                };
                setNodes((nds) => nds.concat(newNode));
            } catch (e) {
                console.error(e);
            }
        },
        [ioLabelInput, nodes, reactFlowInstance, setNodes],
    );

    const onDragStart = useCallback((event: any, nodeType: string, data: any) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({type: nodeType, data}));
        event.dataTransfer.effectAllowed = 'move';
    }, []);

    useEffect(() => {

        // function buildCircuit(){
        //     const inputs = nodes.filter(node => node.type === 'ip');
        //     const outputs = nodes.filter(node => node.type === 'op');
        //     const gates = nodes.filter(node => node.type === 'gate');
        //     const wires = edges;
        //
        //     const visited = new Set<string>();
        //
        //     function simplifyNode(node: Node){
        //         if(node.type === 'ip'){
        //             return node.data.label;
        //         // }else if(node.type === 'op'){
        //         //     return node.data.value;
        //         }else if(node.type === 'gate'){
        //             if (!visited.has(node.id)) {
        //                 visited.add(node.id);
        //                 if (node.data.logic){
        //                     getIncomers(node, nodes, edges).map(node => simplifyNode(node));
        //                 }
        //             }
        //
        //         }
        //     }
        //
        // }

        function simulateCircuit(nodes: Node[], edges: Edge[], inputValues: { [key: string]: boolean }) {

            const inputs = nodes.filter(node => node.type === 'ip');
            const nodeStates = new Map<string, boolean>();
            let queue: Node[] = [];

            inputs.forEach(input => {
                nodeStates.set(input.id + '-o', inputValues[input.id] ?? false);
                queue = [...queue, ...getOutgoers(input, nodes, edges)];
            })


            function calculateNode(node: Node) {
                if (node.type === 'gate') {
                    const gate_inputs = edges.filter(edge => edge.target === node.id).map((edge) => {
                        const sourceValue = nodeStates.get(edge.sourceHandle!) ?? false;
                        nodeStates.set(edge.targetHandle!, sourceValue);
                        return `${edge.targetHandle!.split('-').pop()}=${sourceValue}`;
                    }).join(',');

                    if (!Object.values(node.data.outputs).includes(null)) {
                        Object.keys(node.data.outputs).forEach(output => {
                            let result: boolean;
                            const current = nodeStates.get(node.id + '-o-' + output);
                            console.log(`const ${gate_inputs}; return ${node.data.outputs[output]}`);
                            result = new Function(`let ${node.data.inputs.map((i: string) => i + '=false').join(',')};${gate_inputs}; return ${node.data.outputs[output]}`)();

                            if (current !== result) {
                                nodeStates.set(node.id + '-o-' + output, result);
                                getOutgoers(node, nodes, edges).forEach(node => queue.push(node));
                            }
                        })
                    } else {

                    }
                }

                if (node.type === 'op') {
                    console.log(node.id);
                    const source = edges.find(edge => edge.target === node.id);
                    if (source) {
                        const sourceValue = nodeStates.get(source.sourceHandle!) ?? false;
                        nodeStates.set(node.id + '-i', sourceValue);
                    }
                }
            }

            while (queue.length > 0) {
                const node = queue.shift()!;
                calculateNode(node);
            }

            return Object.fromEntries(nodeStates.entries())
        }

        setOutputValues(simulateCircuit(nodes, edges, inputValues));

    }, [edges, inputValues, nodes]);


    return (
        <ReactFlowProvider>
            <div className="h-screen w-screen" ref={reactFlowWrapper}>
                <ReactFlow
                    nodeTypes={nodeTypes}
                    nodes={nodes.map(node => {
                        if (node.type === 'ip') {
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    value: outputValues[node.id + '-o'] ?? false,
                                    toggle: () => {
                                        setInputValues(prevState => {
                                            return {...prevState, [node.id]: !prevState[node.id]}
                                        })
                                    }
                                },
                            }
                        }
                        if (node.type === 'op') {
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    value: outputValues[node.id + '-i'] ?? false
                                },
                            }
                        }
                        return {
                            ...node,
                            data: {
                                ...node.data, outputs: Object.fromEntries(Object.keys(node.data.outputs).map(i => {
                                    return [i, {...node.data.outputs[i], value: outputValues[node.id + '-o-' + i]}]
                                })), inputvalues: Object.fromEntries(node.data.inputs.map((i: string) => {
                                    return [i, {...node.data.inputs[i], value: outputValues[node.id + '-i-' + i]}]
                                }))
                            }
                        }
                    })}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onEdgeUpdate={onEdgeUpdate}
                    onEdgeUpdateStart={onEdgeUpdateStart}
                    onEdgeUpdateEnd={onEdgeUpdateEnd}
                    proOptions={proOptions}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                >
                    <Background variant={BackgroundVariant.Dots} className="bg-[#353536]" gap={12} size={1}/>
                    <Controls/>
                    <MiniMap/>
                </ReactFlow>
            </div>
            <div className="absolute w-[10%] top-10 left-10 flex flex-col p-4 rounded-lg gap-2 bg-[#1D1D1D] border border-black h-fit ">
                <div>
                    <label className="text-xl m-2">Label: </label>
                    <input type="text" value={ioLabelInput} onChange={(e) => setIoLabelInput(e.target.value)}
                           className="text-black w-full rounded-lg p-1 bg-gray-300 " placeholder={"Label name for input or output"}/>
                </div>
                <div className="w-full p-2 border border-[#303030] rounded text-center text-2xl bg-[#303030]" draggable onDragStart={(e) => {
                    onDragStart(e, "ip", {label: ioLabelInput})
                }}>
                    Input
                </div>
                <div className="w-full p-2 border rounded border-[#303030] text-center text-2xl bg-[#303030] mb-2" draggable onDragStart={(e) => {
                    onDragStart(e, "op", {label: ioLabelInput})
                }}>
                    Output
                </div>
                <hr />
                <span className={"mt"}></span>
                {GateList.map(gate => (
                    <div key={gate.id} className="w-full p-2 border border-[#303030] rounded text-2xl text-center bg-[#303030]" draggable onDragStart={(e) => {
                        onDragStart(e, "gate", gate)
                    }}>
                        {gate.name}
                    </div>
                ))}
            </div>
        </ReactFlowProvider>
    );
}

export default CircuitMaker;