
ymaps.ready(init); 
function init(){
	var myMap = new ymaps.Map("map",{center: [55.85,37.45],zoom: 13});
	
	// Элементы управления картой
	//myMap.controls.add("zoomControl").add("typeSelector").add("mapTools");
	
	ymaps.geocode("г. Москва, Тверская 7").then(function (res) {
		var coord = res.geoObjects.get(0).geometry.getCoordinates();
		var myPlacemark = new ymaps.Placemark(coord, {}, {
			iconImageHref: "/img/map.png",
			iconImageSize: [54, 74],
			iconImageOffset: [-27, -74]
		});
		myMap.geoObjects.add(myPlacemark);
		myMap.setCenter(coord);	
			
		// Сдвиг центра карты вправо
		var newcoord = myMap.getGlobalPixelCenter();
		newcoord[0] -= 150;
		myMap.setGlobalPixelCenter(newcoord);				
	});
}
