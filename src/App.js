import "./App.css";
import { Canvas } from "./Canvas";
import { MeshSelector } from "./MeshSelector";
import { MeshList } from "./MeshList";
import { CylinderEditor } from "./CylinderEditor";
import { CubeEditor } from "./CubeEditor";
import { MeshProperties } from "./MeshProperties";
import { AllMeshes } from "./AllMeshes";
import { IcoSphereEditor } from "./IcoSphereEditor";
import { CursorManager } from "./CursorManager";

function App() {
  return (
    <div className="App">
      <div id="uicont">
        <MeshList />
        <MeshProperties />
      </div>
      <Canvas>
        <CursorManager />
        <MeshSelector />
        <IcoSphereEditor />
        <CylinderEditor />
        <CubeEditor />
        <AllMeshes />
      </Canvas>
    </div>
  );
}

export default App;
