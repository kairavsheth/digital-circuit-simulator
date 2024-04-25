import React from 'react';
import {Handle, Position} from 'reactflow';


const Source = (props: any) => {
    return (
        <Handle {...props} type="source" position={Position.Right} style={{
            height: '15px',
            width: '15px',
            background: props.truth? 'red':'gray',
            borderWidth: '2px',
            borderColor: 'black',
            ...props.style ?? {}
        }}
        ></Handle>
    );
};

export default Source;
