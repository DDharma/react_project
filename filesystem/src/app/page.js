'use client'
import Image from "next/image";
import Folder from "./components/folder/Folder";
import { useState } from "react";
import explorer from "./utility/filesystem";

export default function Home() {

  const [explorerData,setExplorerData] = useState(explorer)
  return (
    <>
      <div>hello files</div>
      <Folder data={explorerData}/>
    </>
    
  );
}
