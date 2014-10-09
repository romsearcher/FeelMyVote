(function() {

    // Matter aliases
    var Engine = Matter.Engine,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Constraint = Matter.Constraint,
        RenderPixi = Matter.RenderPixi,
        Events = Matter.Events,
        Bounds = Matter.Bounds,
        Vector = Matter.Vector,
        Vertices = Matter.Vertices,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Query = Matter.Query;

    // MatterTools aliases
    if (window.MatterTools) {
        var Gui = MatterTools.Gui,
            Inspector = MatterTools.Inspector;
    }

    var Demo = {};

    var _engine,
        _gui,
        _inspector,
        _sceneName,
        _mouseConstraint,
        _sceneEvents = [],
        _useInspector = window.location.hash.indexOf('-inspect') !== -1,
        _isMobile = /(ipad|iphone|ipod|android)/gi.test(navigator.userAgent);
    
    // initialise the demo

    Demo.init = function() {
        var container = document.getElementById('canvas-container');

        // some example engine options
        var options = {
            positionIterations: 6,
            velocityIterations: 4,
            enableSleeping: false
        };

        // create a Matter engine
        // NOTE: this is actually Matter.Engine.create(), see the aliases at top of this file
        _engine = Engine.create(container, options);

        // add a mouse controlled constraint
        _mouseConstraint = MouseConstraint.create(_engine);
        World.add(_engine.world, _mouseConstraint);

        // run the engine
        Engine.run(_engine);

        // default scene function name
        _sceneName = 'mixed';
        
        // get the scene function name from hash
        if (window.location.hash.length !== 0) 
            _sceneName = window.location.hash.replace('#', '').replace('-inspect', '');

        // set up a scene with bodies
        Demo[_sceneName]();

        // set up demo interface (see end of this file)
        //Demo.initControls();
    };

    // call init when the page has loaded fully

    if (window.addEventListener) {
        window.addEventListener('load', Demo.init);
    } else if (window.attachEvent) {
        window.attachEvent('load', Demo.init);
    }

    // each demo scene is set up in its own function, see below

    Demo.mixed = function() {
        var _world = _engine.world;

        Demo.reset();

        var stack = Composites.stack(20, 20, 15, 4, 0, 0, function(x, y, column, row) {
            var sides = Math.round(Common.random(1, 8));

            // triangles can be a little unstable, so avoid until fixed
            // TODO: make triangles more stable
            sides = (sides === 3) ? 4 : sides;

            // round the edges of some bodies
            var chamfer = null;
            if (sides > 2 && Common.random() > 0.7) {
                chamfer = {
                    radius: 10
                };
            }

            switch (Math.round(Common.random(0, 1))) {
            case 0:
                if (Common.random() < 0.8) {
                    return Bodies.rectangle(x, y, Common.random(25, 50), Common.random(25, 50), { chamfer: chamfer });
                } else {
                    return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(25, 30), { chamfer: chamfer });
                }
                break;
            case 1:
                return Bodies.polygon(x, y, sides, Common.random(25, 50), { chamfer: chamfer });
            }
        });

        World.add(_world, stack);
        
        var renderOptions = _engine.render.options;
    };

    Demo.reset = function() {
        var _world = _engine.world;
        
        World.clear(_world);
        Engine.clear(_engine);

        // clear scene graph (if defined in controller)
        var renderController = _engine.render.controller;
        if (renderController.clear)
            renderController.clear(_engine.render);

        // clear all scene events
        for (var i = 0; i < _sceneEvents.length; i++)
            Events.off(_engine, _sceneEvents[i]);

        if (_mouseConstraint.events) {
            for (i = 0; i < _sceneEvents.length; i++)
                Events.off(_mouseConstraint, _sceneEvents[i]);
        }

        if (_world.events) {
            for (i = 0; i < _sceneEvents.length; i++)
                Events.off(_world, _sceneEvents[i]);
        }

        _sceneEvents = [];

        // reset id pool
        Common._nextId = 0;

        // reset random seed
        Common._seed = 0;

        // reset mouse offset and scale (only required for Demo.views)
        Mouse.setScale(_mouseConstraint.mouse, { x: 1, y: 1 });
        Mouse.setOffset(_mouseConstraint.mouse, { x: 0, y: 0 });

        _engine.enableSleeping = false;
        _engine.world.gravity.y = 1;
        _engine.world.gravity.x = 0;
        _engine.timing.timeScale = 1;

        var offset = 5;
        World.add(_world, [
            Bodies.rectangle(400, -offset, 800.5 + 2 * offset, 50.5, { isStatic: true }),
            Bodies.rectangle(400, 600 + offset, 800.5 + 2 * offset, 50.5, { isStatic: true }),
            Bodies.rectangle(800 + offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true }),
            Bodies.rectangle(-offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true })
        ]);

        _mouseConstraint = MouseConstraint.create(_engine);
        World.add(_world, _mouseConstraint);
        
        var renderOptions = _engine.render.options;
        renderOptions.wireframes = true;
        renderOptions.hasBounds = false;
        renderOptions.showDebug = false;
        renderOptions.showBroadphase = false;
        renderOptions.showBounds = false;
        renderOptions.showVelocity = false;
        renderOptions.showCollisions = false;
        renderOptions.showAxes = false;
        renderOptions.showPositions = false;
        renderOptions.showAngleIndicator = true;
        renderOptions.showIds = false;
        renderOptions.showShadows = false;
        renderOptions.background = '#fff';

        if (_isMobile)
            renderOptions.showDebug = true;
    };

})();