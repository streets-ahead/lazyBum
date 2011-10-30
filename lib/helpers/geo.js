var EARTH_RADIUS = 3963;

function deg2rad (deg) {
	return deg * (Math.PI/180);
}

exports.distance = function(point1, point2) {

	var lat1 = point1['latitude'];
	var lon1 = point1['longitude'];
	var lat2 = point2['latitude'];
	var lon2 = point2['longitude'];
	
	var dLat = deg2rad(lat2 - lat1);
	var dLon = deg2rad(lon2 - lon1); 
	var a = Math.sin( dLat / 2 ) * Math.sin( dLat / 2 ) +
	        Math.cos( deg2rad(lat1) ) * Math.cos( deg2rad(lat2) ) * 
	        Math.sin(dLon/2) * Math.sin(dLon/2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
	var d = EARTH_RADIUS * c;

	return d;
}


exports.endpoint = function(start, heading, distance) {
	var lat = deg2rad(start['latitude']);
       lon = deg2rad(start['longitude']);
       headingRad = deg2rad(heading);
       
       endLat = Math.asin(sin(lat) * Math.cos(distance / EARTH_RADIUS) + Math.cos(lat) * Math.sin(distance / EARTH_RADIUS) * Math.cos(headingRad));
       endLon = lon + Math.atan2(Math.sin(headingRad) * Math.sin(distance/EARTH_RADIUS) * Math.cos(lat), Math.cos(distance/EARTH_RADIUS) - Math.sin(lat) * Math.sin(endLat));

       return {'latitude' : rad2deg(endLat), 'longitude' : rad2deg(endLon)};

}

exports.boundingRectangle = function(point, radius) {
	var p0 = endpoint(point, 0, radius);
	var p90 = endpoint(point, 90, radius);
	var p180 = endpoint(point, 180, radius);
	var p270 = endpoint(point, 270, radius);

	var sw = {'latitude' : p180['latitude'], 'longitude' : p270['longitude']};
	var ne = {'latitude' : p0['latitude'], 'longitude' : p90['longitude']};

	return {'sw' : sw, 'ne' : ne};
}

