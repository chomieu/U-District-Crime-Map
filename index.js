function toggle(source) {
    var checkboxes = document.getElementsByClassName("otypes");
    for (var i = 0, n = checkboxes.length; i < n; ++i) {
        checkboxes[i].checked = source.checked;
    }
}

function showCheckboxes() {
    var checkboxes = document.getElementById("checkboxes");
    checkboxes.style.display = "block";
}

function hideCheckboxes() {
    var checkboxes = document.getElementById("checkboxes");
    checkboxes.style.display = "none";
}

function active_time(source) {
    var input = document.getElementById("timeInput");
    var output = document.getElementById("timeOutput");
    var ampm = document.getElementById("ampm");
    if (source.checked) {
        input.disabled = false;
        output.value = 12;
        ampm.innerHTML = " AM";
    }
    else {
        input.value = -1;
        output.value = "";
        ampm.innerHTML = '&nbsp;' + '&nbsp;' + "OFF" + '&nbsp;';
        input.disabled = true;
    }
}

function convert_time(source) {
    var output = document.getElementById("timeOutput");
    var ampm = document.getElementById("ampm");
    if (source.value > 12) {
        output.value = (source.value) - 12;
        if (output.value < 10) {
            output.value = "0" + String(output.value);
        }
        ampm.innerHTML = " PM";
    }
    else if (source.value == 0) {
        output.value = 12;
        ampm.innerHTML = " AM";
    }
    else if (source.value == 12) {
        output.value = 12;
        ampm.innerHTML = " PM";
    }
    else {
        output.value = source.value;
        if (output.value < 10) {
            output.value = "0" + String(output.value);
        }
        ampm.innerHTML = " AM";
    }
}

var bounds = null;

function initMap() {
    var totalCount = 0;
    var count = [];
    var otypes_group = [];
    var otypes = document.getElementsByClassName('otypes');
    var len = 0;
    var data = [];
    var colors = [];

    document.getElementById("Lmap").innerHTML = "<div id='map'></div>";

    var map = new L.map(
        'map', {
            center: [47.6610, -122.309],
            zoom: 14,
            maxBounds: bounds,
            layers: [],
            worldCopyJump: false,
            crs: L.CRS.EPSG3857
        });

    var tile_layer1 = new L.gridLayer.googleMutant({
        type: 'roadmap',
        styles: [{
                "featureType": "administrative.neighborhood",
                "elementType": "labels",
                "stylers": [{
                    "saturation": -100
                }]
            },
            {
                "featureType": "poi",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "featureType": "poi.park",
                "stylers": [{
                    "visibility": "on"
                }]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "featureType": "road",
                "elementType": "labels.icon",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#c0c0c0"
                }]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "featureType": "transit",
                "stylers": [{
                    "visibility": "off"
                }]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#646464"
                }]
            }
        ]
    }).addTo(map);

    var tile_layer2 = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    var tile_layer3 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    });

    var tile_layer4 = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });



    function filters(feature) {
        var months = document.getElementById('month_filter');
        var s_month = months.options[months.selectedIndex].value;
        var years = document.getElementById('year_filter');
        var s_year = years.options[years.selectedIndex].value;
        var times = document.getElementById('timeInput');
        var s_time = times.value;
        var position = 0;
        var color;
        var type;
        for (var i = 0; otypes[i]; ++i) {
            if (otypes[i].checked && (feature.properties.otype == otypes[i].value) && (feature.properties.Month == s_month || s_month == 0) &&
                (feature.properties.Year == s_year || s_year == 0) && (feature.properties.hour == s_time || times.disabled == true)) {
                position = feature.properties.hour;
                color = feature.properties.color;
                if (colors.indexOf(color) == -1) {
                    len++;
                    colors.push(color);
                    otypes_group.push(feature.properties.otype);
                    count.push(Array.apply(null, Array(24)).map(Number.prototype.valueOf, 0));
                }
                count[colors.indexOf(color)][position]++;
                return true;
            }
        }
    }

    var marker_cluster = L.markerClusterGroup({});

    var points = new L.geoJSON(df, {
        filter: filters,
        pointToLayer: function(feature, latlng) {
            totalCount = totalCount + 1;
            return L.circleMarker(latlng, { radius: 7, fillColor: feature.properties.color, color: "#000", weight: 0.3, opacity: 1, fillOpacity: 1 });
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup(feature.properties.text.toString());
        }
    }).addTo(marker_cluster);

    map.addLayer(marker_cluster);

    var layer_control = {
        base_layers: { "Plain": tile_layer1, "Labeled": tile_layer2, "Detailed": tile_layer3, "Satellite": tile_layer4 },
        overlays: { "Clusters": marker_cluster, "Points": points }
    };

    L.control.layers(
        layer_control.base_layers,
        layer_control.overlays, {
            position: 'topleft',
            collapsed: true,
            autoZIndex: true
        }).addTo(map);

    document.getElementById("totalCountOut").innerHTML = totalCount;

    for (var k = 0; k < len; ++k) {
        data.push({
            x: count[k],
            y: ['12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM',
                '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'
            ],
            width: 0.5,
            autosize: true,
            name: otypes_group[k],
            type: 'bar',
            text: count,
            textfont: {
                size: 9
            },
            hoverinfo: 'none',
            orientation: 'h',
            marker: {
                color: colors[k],
            },
        });
    }

    var layout = {
        width: 600,
        margin: {
            l: 50,
            r: 15,
            b: 15,
            t: 35,
        },
        barmode: 'stack',
        title: '<b>Number of Incidents Reported by Time of the Day</b><br><i>Year 2008-2018</i>',
        titlefont: {
            size: 12
        },
        xaxis: {
            title: '',
            showticklabels: true,
        },
        yaxis: {
            autorange: 'reversed',
            tickfont: {
                size: 13,
            },
        },
    };
    Plotly.newPlot('plotly', data, layout);
}

$(window).load(function() {
    initMap();
    $('.mdl-button--primary').css('visibility', 'visible');
});

$(window).resize(function() {
    Plotly.Plots.resize('plotly');
});

$('#add_button').click(function() {
    $('#loader').css('visibility', 'visible');
    setTimeout(function() {
        initMap();
        $('#loader').css('visibility', 'hidden');
    }, 100);
});

var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("dot");
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
}

$('#charts_button').click(function() {
    $('#charts_button').prop('disabled', true);
    $('#map_button').prop('disabled', false);
    $('.cb').show();
    $('.mb').hide();
});

$('#map_button').click(function() {
    $('#map_button').prop('disabled', true);
    $('#charts_button').prop('disabled', false);
    $('.mb').show();
    $('.cb').hide();
});
