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
    disableWebGL2Support: false
  });
};
var createScene = function() {
  let scene = new BABYLON.Scene(engine);
  let camera = new BABYLON.ArcRotateCamera("heroCamera", Math.PI / 2, Math.PI / 4, 10, new BABYLON.Vector3(0, 0, 0), scene);
  camera.rotation.set( 0.39678897402998636,1.09099821817894,0);
  //camera.attachControl(true);
//  camera.detouchControl(true)
  // Our built-in 'sphere' shape.
const pinHeight = 0.4;
const pinDiameter = 0.07;
let names = ["location","character","start_oint"]
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
  let groundC = scene.getMeshByName("collision");
  ground.material.backFaceCulling = true;
  let hero = scene.getMeshByName("character");
  hero.setParent(null);
  window.hero = hero;
  hero.position.y=3
  hero.rotationQuaternion = null;
  hero.position.copyFrom(scene.getMeshByName("Sphere001").position.scale(10,10,10));
  hero.rotation.y = 2.4146;
  //hero.rotation.z = Math.PI;
  //groundC.visibility = 0;
  groundC.position.y-=.1;
  ground.scaling.set(1000,1000,1000);
  groundC.scaling.set(1000,1000,1000);
  let camParent = BABYLON.MeshBuilder.CreateBox("CB", {height: .1, width: .1, depth: .1})
  //camParent.parent = hero;
  camParent.visibility = 0;
  camParent.position.y = 3;
  camera.parent = camParent;
  camera.target.y=3;
  camParent.position = hero.position;
  camParent.rotation = hero.rotation;
  camera.position = new BABYLON.Vector3(0.19035765452352452,6.459144979665817,7.210969419781024);
  addLight();
  addHeroGravitation(hero,groundC);
  console.log(addJoystic);
  addJoystic(hero,BABYLON,engine);
  addFOGmat(groundC,hero);
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
    scene.clearColor = new BABYLON.Color3(256 / 255, 250 / 255, 220 / 255);
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
  let length = 20;
  rayHelper.attachToMesh(rootOfTarget.rayBox, localMeshDirection, rootOfTarget.rayBox.position, length);
  rayHelper.show(scene);
  scene.onBeforeRenderObservable.add(function() {
    rootOfTarget.rayBox.position = new BABYLON.Vector3(0, .7, 0)
    var hitInfo = ray.intersectsMeshes([ground]);
    if (hitInfo.length) {
        rootOfTarget.position.y = hitInfo[0].pickedPoint.y;
    }
  });
}

function addFOGmat(mesh,hero){
  BABYLON.Effect.ShadersStore["myshaderVertexShader"] = `
       attribute vec3 position;
       uniform mat4 world;
       uniform mat4 view;
       uniform mat4 viewProjection;
       varying float fFogDistance;
       void main(void) {
               vec4 worldPosition = world * vec4(position, 1.0);
               fFogDistance = (view * worldPosition).z;
               gl_Position =  viewProjection * worldPosition;
       }`;

BABYLON.Effect.ShadersStore["myshaderFragmentShader"] = `
    #define FOGMODE_NONE 0.
    #define FOGMODE_EXP 1.
    #define FOGMODE_EXP2 2.
    #define FOGMODE_LINEAR 3.
    #define E 2.71828

    uniform vec4 vFogInfos;
    uniform vec3 vFogColor;
    varying float fFogDistance;

    float CalcFogFactor()
    {
        float fogCoeff = 1.0;
        float fogStart = vFogInfos.y;
        float fogEnd = vFogInfos.z;
        float fogDensity = vFogInfos.w;

        if (FOGMODE_LINEAR == vFogInfos.x)
        {
            fogCoeff = (fogEnd - fFogDistance) / (fogEnd - fogStart);
        }
        else if (FOGMODE_EXP == vFogInfos.x)
        {
            fogCoeff = 1.0 / pow(E, fFogDistance * fogDensity);
        }
        else if (FOGMODE_EXP2 == vFogInfos.x)
        {
            fogCoeff = 1.0 / pow(E, fFogDistance * fFogDistance * fogDensity * fogDensity);
        }

        return clamp(fogCoeff, 0.0, 1.0);
    }

    uniform sampler2D textureSampler;
    void main(void) {
        float fog = CalcFogFactor();
        vec3 color = vec3(1.0, 0., 1.0);
        color = fog * color + (1.0 - fog) * vFogColor;
        gl_FragColor = vec4(color, 1.);
    }`;

    var fogMat = new BABYLON.ShaderMaterial("test", scene, {
         vertex: "myshader",
         fragment: "myshader"
     },
     {
         needAlphaBlending: true,
         attributes: ["position"],
         uniforms:   ["world","view","viewProjection", "vFogInfos", "vFogColor"],
         samplers:   []
     });
     mesh.material = fogMat;

     scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
     scene.fogStart = 40;
     scene.fogEnd = 60;

     scene.fogColor = scene.clearColor;
     fogMat.onBind = function(mesh) {
        var effect = fogMat.getEffect();
        effect.setFloat4("vFogInfos", scene.fogMode, scene.fogStart, scene.fogEnd, scene.fogDensity);
        effect.setColor3("vFogColor", scene.fogColor);
      }
  let centerPos = new BABYLON.Vector3(-30.54143837352734,-0.07580753949230623,34.19776404584352);
  scene.registerBeforeRender(()=>{
    scene.fogStart = 40 - hero.position.subtract(centerPos).length();
    //document.querySelector(".js-fps").innerHTML = scene.fogStart +","+ hero.position.subtract(centerPos).length();
  })
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
