
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // マップのスタイル（デザイン）
    center: campground.geometry.coordinates, // 初期に表示する地図の緯度経度 [経度、緯度]（緯度、経度とは順番が異なりますのでご注意下さい）
    zoom: 9 // 初期に表示する地図のズームレベル
});

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates) 
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${campground.title}</h3><p>${campground.location}</p>`
        )
    )
    .addTo(map)