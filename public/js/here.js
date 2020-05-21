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

        // Browse Location
        let spaces = []
        const fetchSpaces = function (lat, lng, rad) {
            return new Promise((resolve, reject) => {
                resolve(
                    fetch(`http://localhost:8000/api/spaces?lat=${lat}&lng=${lng}&rad=${rad}`)
                        .then((response) => response.json())
                        .then((data) => {
                            data.forEach((val, index) => {
                                // console.log(val)
                                let marker = new H.map.Marker({
                                    lat: val.latitude, lng: val.longitude
                                })
                                spaces.push(marker)
                            })
                        })
                )
            })
        }

        function clearSpace () {
            map.removeObjects(spaces)
            spaces = []
        }

        function init (lat, lng, rad) {
            clearSpace()
            fetchSpaces(lat, lng, rad)
                .then(() => {
                    map.addObjects(spaces)
                })
        }

        if (window.action == 'browse') {
            map.addEventListener('dragend', function (ev) {
                let resultCoord = map.screenToGeo(
                    ev.currentPointer.viewportX,
                    ev.currentPointer.viewportY,
                )
                init(resultCoord.lat, resultCoord.lng, 40)
            }, false)

            init(objLocalCoord.lat, objLocalCoord.lng, 40)
        }

        // Route to Space
        let urlParams = new URLSearchParams(window.location.search)

        // utk menghitung jarak tempuh
        function calculateRouteAtoB (platform) {
            let router = platform.getRoutingService(),
                routeRequestParam = {
                    mode: 'fastest;car',
                    representation: 'display',
                    routeattributes : 'summary',
                    maneuverattributes: 'direction,action',
                    waypoint0: urlParams.get('from'),
                    waypoint1: urlParams.get('to')
                }

            router.calculateRoute(
                routeRequestParam,
                onSuccess,
                onError
            )
        }

        function onSuccess(result) {
            route = result.response.route[0];

            addRouteShapeToMap(route);
            addSummaryToPanel(route.summary);
        }

        function onError(error) {
            alert('Can\'t reach the remote server' + error);
        }

        function addRouteShapeToMap(route){
            let linestring = new H.geo.LineString(),
                routeShape = route.shape,
                startPoint, endPoint,
                polyline, routeline, svgStartMark, iconStart, startMarker, svgEndMark, iconEnd, endMarker;

            routeShape.forEach(function(point) {
                let parts = point.split(',');
                linestring.pushLatLngAlt(parts[0], parts[1]);
            });

            startPoint = route.waypoint[0].mappedPosition;
            endPoint = route.waypoint[1].mappedPosition;

            polyline = new H.map.Polyline(linestring, {
                style: {
                lineWidth: 5,
                strokeColor: 'rgba(0, 128, 255, 0.7)',
                lineTailCap: 'arrow-tail',
                lineHeadCap: 'arrow-head'
                }
            });

            routeline = new H.map.Polyline(linestring, {
                style: {
                    lineWidth: 5,
                    fillColor: 'white',
                    strokeColor: 'rgba(255, 255, 255, 1)',
                    lineDash: [0, 2],
                    lineTailCap: 'arrow-tail',
                    lineHeadCap: 'arrow-head'
                }
            });

            svgStartMark = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 52 52" style="enable-background:new 0 0 52 52;" xml:space="preserve" width="512px" height="512px"><g><path d="M38.853,5.324L38.853,5.324c-7.098-7.098-18.607-7.098-25.706,0h0  C6.751,11.72,6.031,23.763,11.459,31L26,52l14.541-21C45.969,23.763,45.249,11.72,38.853,5.324z M26.177,24c-3.314,0-6-2.686-6-6  s2.686-6,6-6s6,2.686,6,6S29.491,24,26.177,24z" data-original="#1081E0" class="active-path" data-old_color="#1081E0" fill="#C12020"/></g> </svg>`;

            iconStart = new H.map.Icon(svgStartMark, {
                size: { h: 45, w: 45 }
            });

            startMarker = new H.map.Marker({
                lat: startPoint.latitude,
                lng: startPoint.longitude
            }, { icon: iconStart });

            svgEndMark = `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 52 52" style="enable-background:new 0 0 52 52;" xml:space="preserve"> <path style="fill:#1081E0;" d="M38.853,5.324L38.853,5.324c-7.098-7.098-18.607-7.098-25.706,0h0 C6.751,11.72,6.031,23.763,11.459,31L26,52l14.541-21C45.969,23.763,45.249,11.72,38.853,5.324z M26.177,24c-3.314,0-6-2.686-6-6 s2.686-6,6-6s6,2.686,6,6S29.491,24,26.177,24z"/></svg>`;

            iconEnd = new H.map.Icon(svgEndMark, {
                size: { h: 45, w: 45 }
            });

            endMarker = new H.map.Marker({
                lat: endPoint.latitude,
                lng: endPoint.longitude
            }, { icon: iconEnd });


            // Add the polyline to the map
            map.addObjects([polyline, routeline, startMarker, endMarker]);

            // And zoom to its bounding rectangle
            map.getViewModel().setLookAtData({
                bounds: polyline.getBoundingBox()
            });
        }

        function addSummaryToPanel(summary){
            const sumDiv = document.getElementById('summary');
            const markup = `
                <ul>
                    <li>Total Distance: ${summary.distance/1000}Km</li>
                    <li>Travel Time: ${summary.travelTime.toMMSS()} (in current traffic)</li>
                </ul>
            `;
            sumDiv.innerHTML = markup;
        }

        if (window.action == "direction") {
            calculateRouteAtoB(platform);

            Number.prototype.toMMSS = function () {
                return  Math.floor(this / 60)  +' minutes '+ (this % 60)  + ' seconds.';
            }
        }

    })
        // Open URL Direction
        function openDirection (lat, lng, id) {
            window.open(`/space/${id}?from=${objLocalCoord.lat},${objLocalCoord.lng}&to=${lat},${lng}`,"_self")
        }
    } else {
    console.error('Geolocation not support in this browser.')
}