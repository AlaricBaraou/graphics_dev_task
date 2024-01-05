import "./App.css";
import { Canvas } from "./Canvas";
import { MeshSelector } from "./MeshSelector";
import { MeshList } from "./MeshList";
import { CylinderEditor } from "./CylinderEditor";
import { CubeEditor } from "./CubeEditor";

function App() {
  return (
    <div className="App">
      <div id="uicont">
        <MeshList />
        <CylinderEditor />
        <CubeEditor />
      </div>
      <Canvas>
        <MeshSelector />
      </Canvas>
    </div>
  );
}

export default App;
