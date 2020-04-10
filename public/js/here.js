if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        localCoord = position.coords
        objLocalCoord = {
            lat: localCoord.latitude,
            lng: localCoord.longitude
        }

        // Initialize the platform object:
      var platform = new H.service.Platform({
        'apikey': window.hereApiKey
      });

      // Obtain the default map types from the platform object
      var maptypes = platform.createDefaultLayers();

      // Instantiate (and display) a map object:
      var map = new H.Map(
        document.getElementById('map-container'),
        maptypes.vector.normal.map,
        {
            zoom: 13,
            center: objLocalCoord,
            pixelRatio: window.devicePixelRatio
        });

        window.addEventListener('resize', () => map.getViewPort().resize())

        let ui = H.ui.UI.createDefault(map, maptypes)
        let mapEvents = new H.mapevents.MapEvents(map)
        let behavior = new H.mapevents.Behavior(mapEvents)
        
        function addDraggable (map, behavior) {
            let lat = document.getElementById('lat')
            let lng = document.getElementById('lng')
    
            if (lat.value != '' && lng.value != '') {
                objLocalCoord = {
                    lat: lat.value,
                    lng: lng.value
                }
            }
    
            let marker = new H.map.Marker(objLocalCoord, {
                volatility: true
            })
    
            marker.draggable = true
            map.addObject(marker)
    
            map.addEventListener('dragstart', function(evt) {
                let target = evt.target,
                    pointer = evt.currentPointer
    
                if (target instanceof H.map.Marker) {
                    let targetPosition = map.geoToScreen(target.getGeometry())
                    target['offset'] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y)
                    behavior.disable()
                }
            }, false);
    
            map.addEventListener('drag', function(evt) {
                let target = evt.target,
                    pointer = evt.currentPointer
    
                if (target instanceof H.map.Marker) {
                    target.setGeometry(map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y))
                }
            }, false);
    
            map.addEventListener('dragend', function(evt) {
                let target = evt.target
    
                if (target instanceof H.map.Marker) {
                    behavior.enable()
                    let resultCoord = map.screenToGeo(
                        evt.currentPointer.viewportX,
                        evt.currentPointer.viewportY
                    )
    
                    lat.value = resultCoord.lat.toFixed(5)
                    lng.value = resultCoord.lng.toFixed(5)
                }
            }, false);
        }

        if (window.action == 'submit') {
            addDraggable(map, behavior)
        }
    })
} else {
    console.error('Geolocation not support in this browser.')
}