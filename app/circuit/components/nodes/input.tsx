import React from 'react';
import {NodeProps} from "reactflow";
import Source from "@/app/circuit/components/handles/source";

// import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

function Input(props: NodeProps) {

    return (
        <div className="bg-[#331819] text-sm flex justify-center items-center border-2 border-black p-4 text-white rounded-[50%] h-[100px] w-[100px]">
            <div className="flex flex-col">
                <label className={"mb-2"}>Input: {props.data.label}</label>
                <input type="checkbox" checked={props.data.value} onChange={() => props.data.toggle()}
                       className="nodrag"/>
            </div>
            <Source
                truth={props.data.value}
                type="source"
                id={props.id + '-o'}
            />
        </div>
    );
}

export default Input;