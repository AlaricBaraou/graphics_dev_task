import "./App.css";
import { Canvas } from "./Canvas";
import { MeshSelector } from "./MeshSelector";
import { MeshList } from "./MeshList";
import { CylinderEditor } from "./CylinderEditor";
import { CubeEditor } from "./CubeEditor";
import { MeshProperties } from "./MeshProperties";
import { AllMeshes } from "./AllMeshes";

function App() {
  return (
    <div className="App">
      <div id="uicont">
        <MeshList />
        <MeshProperties />
      </div>
      <Canvas>
        <MeshSelector />
        <CylinderEditor />
        <CubeEditor />
        <AllMeshes />
      </Canvas>
    </div>
  );
}

export default App;
