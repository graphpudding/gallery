let addJoystic = function(hero, BABYLON, engine) {
  let isMobileOrTablet = function() {
    var check = false;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
      check = true;
    }
    if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
      check = true;
    }
    return check;
  }

  let clamp = (num, min, max) => Math.min(Math.max(num, min), max);
  let scene = window.scene;
  let local = window.local;

  function blendTo(name, to, det) {
    if (local[name] > to) {
      local[name] -= (1 / det);
    } else {
      local[name] += (1 / det);
    }
  }
  local.fps = 75;
  scene.registerBeforeRender(() => {
    local.fps = engine.getFps().toFixed();
  //  document.querySelector(".js-fps").innerHTML = local.fps;
  })
  let WSpeed = (2.825 * 1.5) / local.fps;
  let mRotSpeed = (.07 * 75) / local.fps;
  scene.getAnimationGroupByName("idle").name = "local.heroIdle";
  local.idleAnim = scene.animationGroups.find(a => a.name === "local.heroIdle");
  local.idleParam = {
    name: "local.heroIdle",
    anim: local.idleAnim,
    weight: 1
  };
  local.idleAnim.play(true);
  local.idleAnim.setWeightForAllAnimatables(1);
  scene.getAnimationGroupByName("walk").name = "local.heroWalk";
  local.walkAnim = scene.animationGroups.find(a => a.name === "local.heroWalk");
  local.walkParam = {
    name: "local.heroWalk",
    anim: local.walkAnim,
    weight: 0
  };
  local.walkAnim.play(true);
  local.walkAnim.setWeightForAllAnimatables(1);

  function BlendAnims(blend) {
    //idle
    local.idleParam.weight = 1 - clamp(blend, 0, 1);
    local.idleParam.anim.setWeightForAllAnimatables(local.idleParam.weight);
    //walk
    local.walkParam.weight = 1 - Math.abs(blend - 1);
    local.walkParam.anim.setWeightForAllAnimatables(local.walkParam.weight);
    //run
    //local.runParam.weight = clamp(blend - 1, 0, 1);
    //local.runParam.anim.setWeightForAllAnimatables(local.runParam.weight);
    //local.heroSpeed
  }

  if (isMobileOrTablet()) {
    let joystickSizes = {
      vertice: {
        static: {
          height: "25%",
          width: "45%",
          left: "-3%",
          top: "-9%",
        },
        inMove: {
          height: "75%",
          width: "85%",
          left: "17%",
          top: "16%",
          offsetL: .3,
          offsetT: .28,
        }
      },
      gorizontal: {
        static: {
          height: "25%",
          width: "45%",
          left: "2.5%",
          top: "-7%",
        },
        inMove: {
          height: "75%",
          width: "85%",
          left: "23%",
          top: "19%",
          offsetL: .225,
          offsetT: .25,
        }
      }
    }
    let Jsizes = document.body.clientWidth < 420 ? joystickSizes.vertice : joystickSizes.gorizontal;
    local.Jblend = 0;
    let joystikMove = scene.onBeforeRenderObservable.add(function() {
      if (local.Jblend >= .1 && local.fps > 15) {
        BlendAnims(local.Jblend);
        local.hero.moveWithCollisions(local.hero.forward.scaleInPlace(WSpeed * (local.Jblend / 2)));
      }
    });
    let makeThumbArea  = function (name, thickness, color, background, curves) {
      let rect = new BABYLON.GUI.Ellipse();
      rect.name = name;
      rect.thickness = thickness;
      rect.color = color;
      rect.background = background;
      rect.paddingLeft = "0px";
      rect.paddingRight = "0px";
      rect.paddingTop = "0px";
      rect.paddingBottom = "0px";

      return rect;
    }

    let xAddPos = 0;
    let yAddPos = 0;
    adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let adt = adt;
    let leftThCont = makeThumbArea("leftThumb", 2, "rgba(175,99,230,0)", null);
    leftThCont.height = Jsizes.static.height;
    leftThCont.width = Jsizes.static.width;
    leftThCont.isPointerBlocker = true;
    leftThCont.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    leftThCont.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    leftThCont.alpha = 1;
    leftThCont.left = Jsizes.static.left;
    leftThCont.top = Jsizes.static.top;

    let leftInThCont = makeThumbArea("leftInnterThumb", 4, "rgb(175,99,230)", null);
    leftInThCont.height = "55px";
    leftInThCont.width = "55px";
    leftInThCont.isPointerBlocker = true;
    leftInThCont.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    leftInThCont.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    leftInThCont.alpha = .8;


    let leftPuck = makeThumbArea("leftPuck", 0, "rgb(175,99,230)", "rgb(175,99,230)");
    leftPuck.height = "45px";
    leftPuck.width = "45px";
    leftPuck.alpha = 0;
    leftPuck.isPointerBlocker = true;
    leftPuck.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    leftPuck.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

    leftThCont.onPointerDownObservable.add(function(coordinates) {
      leftPuck.isVisible = true;
      leftPuck.floatLeft = adt._canvas.width - coordinates.x + (leftThCont._currentMeasure.width * Jsizes.inMove.offsetL) * -1; //sideJoyOff;
      leftPuck.left = leftPuck.floatLeft;
      leftPuck.floatTop = adt._canvas.height - coordinates.y + (leftThCont._currentMeasure.height * Jsizes.inMove.offsetT); //bottomJoystickOffset;
      leftPuck.top = leftPuck.floatTop * -1;
      leftPuck.isDown = true;
      leftThCont.height = Jsizes.inMove.height;
      leftThCont.width = Jsizes.inMove.width;
      leftThCont.left = Jsizes.inMove.left;
      leftThCont.top = Jsizes.inMove.top;
      //    leftThCont.alpha = 1;
    });

    leftThCont.onPointerUpObservable.add(function(coordinates) {
      xAddPos = 0;
      yAddPos = 0;
      leftPuck.isDown = false;
      leftPuck.isVisible = false;
      leftThCont.height = Jsizes.static.height;
      leftThCont.width = Jsizes.static.width;
      leftThCont.left = Jsizes.static.left;
      leftThCont.top = Jsizes.static.top;
      leftThCont.alpha = .8;
      leftPuck.alpha = 0;
    });

    leftThCont.onPointerMoveObservable.add(function(coordinates) {
      if (leftPuck.isDown) {
        xAddPos = (adt._canvas.width - coordinates.x - (leftThCont._currentMeasure.width * Jsizes.inMove.offsetL)) * -1;
        yAddPos = adt._canvas.height - coordinates.y - (leftThCont._currentMeasure.height * Jsizes.inMove.offsetT);
        leftPuck.floatLeft = xAddPos;
        leftPuck.floatTop = yAddPos * -1;
        leftPuck.left = leftPuck.floatLeft;
        leftPuck.top = leftPuck.floatTop;
        leftPuck.alpha = 0;
        leftThCont.height = Jsizes.inMove.height;
        leftThCont.width = Jsizes.inMove.width;
        leftThCont.left = Jsizes.inMove.left;
        leftThCont.top = Jsizes.inMove.top;
        leftPuck.alpha = .8;
      }
    });

    adt.addControl(leftThCont);
    leftThCont.addControl(leftInThCont);
    leftThCont.addControl(leftPuck);
    leftPuck.isVisible = false;

    scene.registerBeforeRender(function() {
      if (Math.abs(xAddPos / 50) > .25) {
        local.hero.rotation.y += (mRotSpeed * (xAddPos / 175) * .2);
      }
      if (leftPuck.isDown) {
        local.Jblend = yAddPos / 66 < 1 ? yAddPos / 50 : 1;
      } else {
        if (local.Jblend > .1) {
          blendTo("Jblend", 0, local.fps / 3);
        } else {
          local.Jblend = 0;
          BlendAnims(0);
        }
      }
    });
    window.addEventListener("resize", function() {
      Jsizes = document.body.clientWidth < 420 ? joystickSizes.vertice : joystickSizes.gorizontal;
      leftThCont.height = Jsizes.static.height;
      leftThCont.width = Jsizes.static.width;
      if (leftThCont.left != "1000px") {
        leftThCont.left = Jsizes.static.left;
      }
      leftThCont.top = Jsizes.static.top;
    });
  } else {
    BlendAnims(0);
    let btnRot = 0;
    window.addEventListener('keydown', function(event) {
      if (event.code == 'ArrowRight') {
        btnRot = .03
      }
      if (event.code == 'ArrowLeft') {
        btnRot = -.03
      }
      if (event.code == 'ArrowUp') {
        local.Jblend = 1
      }
    })
    window.addEventListener('keyup', function(event) {
      if (event.code == 'ArrowRight' || event.code == 'ArrowLeft') {
        btnRot = 0;
      }
      if (event.code == 'ArrowUp') {
        local.Jblend = 0;
          BlendAnims(0);
      }
    })
    scene.registerBeforeRender(function() {
      if (local.Jblend >= .1 && local.fps > 15) {
        BlendAnims(local.Jblend);
        local.hero.moveWithCollisions(local.hero.forward.scaleInPlace(WSpeed));
      }
      local.hero.rotation.y += btnRot;
    });
  }

}
export {
  addJoystic
};
