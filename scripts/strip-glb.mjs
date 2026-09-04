import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, simplify } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read("public/assets/ABeautifulGame.glb");
const root = doc.getRoot();
for (const mesh of [...root.listMeshes()]) {
  const name = (mesh.getName() || "").toLowerCase();
  if (name.includes("chessboard") || name.includes("board")) {
    mesh.dispose();
  }
}
await doc.transform(
  dedup(),
  prune(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.12, error: 0.002 }),
  prune(),
);
await io.write("public/assets/pieces-staunton.glb", doc);
console.log("wrote public/assets/pieces-staunton.glb");
