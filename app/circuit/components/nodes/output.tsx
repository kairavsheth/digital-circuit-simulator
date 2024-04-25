import React from 'react';
import {NodeProps} from "reactflow";
import Target from "@/app/circuit/components/handles/target";

// import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

function Output(props: NodeProps) {

    return (
        <div className="bg-black text-sm flex justify-center items-center text-white border-2 border-black p-4 rounded-[50%] h-[100px] w-[100px]">
            <div className="flex flex-col">
                <label className={"mb-2"}>Output: {props.data.label}</label>
                <input type="checkbox" checked={props.data.value} className="nodrag"/>
            </div>
            <Target
                truth={props.data.value}
                id={props.id + '-i'}
                style={{
                    height: '15px',
                    width: '15px',
                    borderWidth: '2px',
                    borderColor: 'black'
                }}
            />
        </div>
    );
}

export default Output;