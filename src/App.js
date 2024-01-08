import "./App.css";
import { Canvas } from "./components/Canvas";
import { MeshSelector } from "./components/MeshSelector";
import { MeshList } from "./components/dom/MeshList";
import { CylinderEditor } from "./components/CylinderEditor";
import { CubeEditor } from "./components/CubeEditor";
import { MeshProperties } from "./components/MeshProperties";
import { AllMeshes } from "./components/AllMeshes";
import { IcoSphereEditor } from "./components/IcoSphereEditor";
import { CursorManager } from "./components/CursorManager";

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
