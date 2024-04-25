import React from 'react';
import {NodeProps} from "reactflow";
import Target from "@/app/circuit/components/handles/target";
import Source from "@/app/circuit/components/handles/source";


function Gate(props: NodeProps) {

    console.log(props);
    return (
        <div
            className={` border-2 border-black p-4 text-white font-bold min-h-[${Math.max(props.data.inputs.length, props.data.outputs.length) * 10}px]`}
            style={{backgroundColor: props.data.color}}>
            {props.data.inputs ? props.data.inputs.map((input: string, idx: number) =>
                <Target
                    truth={props.data.inputvalues[input].value}
                    title={input}
                    key={input}
                    id={props.id + '-i-' + input}
                    style={{
                        top: `${(70 * idx / (props.data.inputs.length - 1)) + 15}%`,
                    }}/>
            ) : null}
            <div className={`bg-[${props.data.color}] flex flex-col`}>
                <label>{props.data.name}</label>
            </div>
            {props.data.outputs ? Object.keys(props.data.outputs).map((output: string, idx: number) =>
                <Source
                    truth={props.data.outputs[output].value}
                    title={output}
                    key={output}
                    id={props.id + '-o-' + output}
                    style={{
                        top: `${(70 * idx / (props.data.outputs.length - 1)) + 15}%`,
                    }}
                />
            ) : null}

        </div>
    );
}

export default Gate;