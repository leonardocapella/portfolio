"use client";
import dynamic from "next/dynamic";
export default dynamic(() => import("./Keyboard3D"), { ssr: false });
