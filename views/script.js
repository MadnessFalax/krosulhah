map_loaded = false;

displayed = null;

cur_pin = null;

cur_weather = null;

const xhttp = new XMLHttpRequest();

function initMap() {
    var location = {lat: 50.075, lng: 14.437};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: location,
        mapId: "898a2d16128f0c62",
        streetViewControl: false,
        mapTypeControl: false
    });

    map_loaded = true;
}

function button_callback() {
    el = document.getElementById("location-query");
    output = el.value;

    if(output === "")
        return;

    console.log(output);

    promise_master = new Promise(function (resolve_master, reject_master) {
        
        promise = new Promise(function (resolve, reject) {
            xhttp.onload = function() {
                m_res = this.responseText;
                obj = JSON.parse(m_res);
                //placeMarker(obj);
                
                resolve(obj);
            };
            xhttp.open("GET", "/loc?location=" + String(output), true);
            xhttp.send();
            
        })
        
        promise.then(function (result) {
            xhttp.onload = function() {
                console.log("getting response");
                w_res = this.responseText;
                obj = JSON.parse(w_res);
                console.log(w_res);
                
                el_buttons = document.getElementById("day-selection");
                el_buttons.innerHTML = "";
                el_display = document.getElementById("weather-display");
                el_display.innerHTML = "";
                node = document.createElement("h3");
                node.classList.add("m-3");
                node.textContent = "Předpověď: ";
                el_buttons.appendChild(node);

                obj.forEach(function (value, index, array) {
                    node = document.createElement("button");
                    node.classList.add("btn");
                    node.classList.add("btn-primary");
                    node.classList.add("m-3");

                    node.addEventListener("click", function () {
                        if(displayed != null) {
                            element = document.getElementById(displayed);
                            element.classList.remove("d-block");
                            element.classList.add("d-none");
                        }
                        element = document.getElementById(value.date);
                        element.classList.remove("d-none");
                        element.classList.add("d-block");
                        displayed = value.date;
                    })

                    if(index == 0)
                        node.textContent = "Dnes";
                    else if(index == 1)
                        node.textContent = "Zítra";
                    else if(index == 2)
                        node.textContent = "Pozítří";

                    el_buttons.appendChild(node);

                    display_node = document.createElement("div");
                    display_node.classList.add("d-flex");
                    display_node.classList.add("flex-row");
                    display_node.classList.add("m-width");
                    display_node.classList.add("d-none");
                    display_node.classList.add("flex-wrap");
                    display_node.id = value.date;
                    el_display.appendChild(display_node);

                    value.hours.forEach(function(sub_value, index, array) {
                        node = document.createElement("div");
                        node.classList.add("d-flex");
                        node.classList.add("flex-column");
                        node.classList.add("align-items-center");
                        node.classList.add("p-2");
                        node.classList.add("b-gray");
                        display_node.appendChild(node);
                        
                        child = document.createElement("strong");
                        child.textContent = sub_value.time;
                        node.appendChild(child);
                        
                        child = document.createElement("img");
                        child.setAttribute("src", sub_value.icon);
                        node.appendChild(child);

                        child = document.createElement("span");
                        child.classList.add("fs-24px");
                        child.textContent = sub_value.temp_c + " °C";
                        node.appendChild(child);

                        child = document.createElement("span");
                        child.textContent = sub_value.condition;
                        node.appendChild(child);
                        
                        resolve_master(result);
                    });
                });
            }
            xhttp.open("GET", "/weather?location=" + JSON.stringify(result), true);
            xhttp.send();
            
            return result;
            
        });

    });
    
    promise_master.then(function (result) {
        xhttp.onload = function() {
            cw_res = this.responseText;
            obj = JSON.parse(cw_res);
            console.log(cw_res);

            cur_weather = obj;

            placeAdvMarker(result, obj);

        }
        xhttp.open("GET", "/weather_cur?location=" + JSON.stringify(result), true);
        xhttp.send();

        console.log(result);

    });
};

function placeMarker(location) {
    a = String(location);
    console.log(a);

    if(cur_pin != null)
        removeMarker(cur_pin);

    cur_pin = new google.maps.Marker({
        position: location,
        map: map
    });

}

function placeAdvMarker(location, data) {
    if(cur_pin != null)
        removeMarker(cur_pin);

    pin_content = document.createElement("div");
    pin_content.classList.add("d-flex");
    pin_content.classList.add("flex-column");
    pin_content.classList.add("justify-content-center");
    pin_content.classList.add("m-pin");
    
    child = document.createElement("img");
    child.setAttribute("src", data.icon);
    pin_content.appendChild(child);

    child = document.createElement("strong");
    child.classList.add("fs-24px");
    child.classList.add("text-center");
    child.textContent = data.temp_c;
    pin_content.appendChild(child);

    cur_pin = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: location,
        content: pin_content,
    });
}

function removeMarker(marker) {
    marker.setMap(null);
}

document.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {

      event.preventDefault();
      document.getElementById("search_but").click();
    }
});