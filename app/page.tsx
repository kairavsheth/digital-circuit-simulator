import React from 'react';
import Image from "next/image";
import D from "@/public/logic-gate-or-svgrepo-com.svg"
import cir from "@/public/8bvaKz01 (1).svg"

function Home() {
    return (
        <div className={"min-h-screen bg-[#353536] flex flex-col justify-center items-center"}>
            <div className={"flex flex-row items-center justify-center text-center"}>
                <Image src={D} alt={"D"} style={{
                    height: '10vmax',
                }}/>
                <h1 className={"text-white sm:text-3xl lg:text-5xl m-4"}>
                igital Circuit Simulator</h1>
            </div>
            <div className={"text-center text-white sm:text-xl lg:text-3xl mb-4  max-w-[40%]"}>Build, test, and analyze your digital circuits virtually before ever touching a breadboard!!</div>
            <Image src={cir} alt="cir" style={{
                height: '15vmax'
            }}/>
            <button className="rounded-lg border-2 border-black p-2 m-2 hover:bg-gray-400 text-black bg-gray-100 text-2xl font-semibold">Try it out!!</button>
        </div>
    );
}

export default Home;