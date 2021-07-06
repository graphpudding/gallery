import './styles/index.scss';
import './assets/fonts/Roboto-Regular.ttf';
import {addJoystic} from './joystik.js';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import * as GUI from 'babylonjs-gui';
BABYLON.GUI = GUI;
let local = {};
window.local = local;
var canvas = document.getElementById("babylon");
var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function() {
  return new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: true
  });
};
var createScene = function() {
  let scene = new BABYLON.Scene(engine);
  let camera = new BABYLON.ArcRotateCamera("heroCamera", Math.PI / 2, Math.PI / 4, 10, new BABYLON.Vector3(0, 0, 0), scene);
  camera.rotation.set( 0.39678897402998636,1.09099821817894,0 );
  camera.attachControl(true)
//  camera.detouchControl(true)
  // Our built-in 'sphere' shape.
const pinHeight = 0.4;
const pinDiameter = 0.07;
let names = ["character","location2"]
  let nameNum=0;
  loadSync()
function loadSync(){
  BABYLON.SceneLoader.AppendAsync("", names[nameNum]+".glb",scene).then(()=>{
    scene.getMeshByName("__root__").name = names[nameNum];
    scene.getMeshByName(names[nameNum]).rotationQuaternion = null;
    nameNum++;
    if(nameNum < names.length){
      setTimeout(()=>{loadSync();},100)
    }else{
      afterLoad();
    }
  })
}
function afterLoad(){
  let ground = scene.getMeshByName("attribpromote4");
  let location2 = scene.getMeshByName("location2");
  scene.getMeshByName("Alpha_Surface");
  //ground.setParent(null);
  let hero = scene.getMeshByName("character");
  hero.setParent(null);
  window.hero = hero;
  hero.rotation.z = Math.PI;
  //collision.visibility=0;
  ground.scaling.set(10000,10000,10000);
  let camParent = BABYLON.MeshBuilder.CreateBox("CB", {height: .1, width: .1, depth: .1})
  camParent.parent = hero;
  camParent.visibility=0;
  camParent.position.y = 3;
  camera.parent = camParent;
  camera.position = new BABYLON.Vector3(-0.06584828838118072,1.6740525716943604,-9.85866177481106);
  addLight();
  addHeroGravitation(hero,ground);
  console.log(addJoystic);
  addJoystic(hero,BABYLON,engine);
}
function addHeroMobility(){

}
function addLight() {
    let lighting = BABYLON.CubeTexture.CreateFromPrefilteredData("https://assets.babylonjs.com/environments/environmentSpecular.env", scene);
    lighting.name = "runyonCanyon";
    lighting.gammaSpace = false;
    scene.environmentTexture = lighting;
    scene.createDefaultSkybox(scene.environmentTexture, true, (scene.activeCamera.maxZ - scene.activeCamera.minZ) / 2, 0.3, false);
    scene.getMeshByName("hdrSkyBox").visibility = 0;
    scene.clearColor = new BABYLON.Color3(206 / 255, 220 / 255, 220 / 255);
}

function addHeroGravitation(rootOfTarget,ground) {
  let rayName =  "heroRay";
  rootOfTarget.rayBox = BABYLON.MeshBuilder.CreateBox("rayBox", {
    height: .1,
    width: .1,
    depth: .1
  }, scene);
  rootOfTarget.rayBox.parent = rootOfTarget;
  rootOfTarget.rayBox.position = new BABYLON.Vector3(0, 0.07, 0);
  rootOfTarget.rayBox.visibility = 0;
  let ray = new BABYLON.Ray();
  let rayHelper = new BABYLON.RayHelper(ray);
  let localMeshDirection = new BABYLON.Vector3(0, -1*Math.PI, 0);
  let length = 10;
  rayHelper.attachToMesh(rootOfTarget.rayBox, localMeshDirection, rootOfTarget.rayBox.position, length);
  //rayHelper.show(scene);
  scene.onBeforeRenderObservable.add(function() {
    rootOfTarget.rayBox.position = new BABYLON.Vector3(0, .7, 0)
    var hitInfo = ray.intersectsMeshes([scene.getMeshByName("attribpromote4")]);
    if (hitInfo.length) {
        rootOfTarget.position.y = hitInfo[0].pickedPoint.y;
    }
  });
}




  return scene;
};

var asyncEngineCreation = async function() {
  console.log(createDefaultEngine())
  try {
    return createDefaultEngine();
  } catch (e) {
    console.log("the available createEngine function failed. Creating the default engine instead");
    return createDefaultEngine();
  }
}
window.initFunction = async function() {

  engine = await asyncEngineCreation();
  if (!engine) throw 'engine should not be null.';
  scene = createScene();
  window.scene = scene;
};
window.initFunction().then(() => {
  sceneToRender = scene
  engine.runRenderLoop(function() {
    if (sceneToRender && sceneToRender.activeCamera) {
      sceneToRender.render();
    }
  });
});

// Resize
window.addEventListener("resize", function() {
  engine.resize();
});
