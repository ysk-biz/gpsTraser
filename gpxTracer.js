var map = L.map('mapcontainer', { zoomControl: false });

// L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
//         attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
// }).addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
}).addTo(map);

var mpoint = [35.681236, 139.767125];
map.setView(mpoint, 15);
// マーカーを初期化
var marker = L.marker([0, 0]).addTo(map);
// var popup = L.popup().addTo(map);

// マーカーの移動時に地図の中心を変更する
marker.on('move', function(event) {
	map.panTo(marker.getLatLng()); // マーカーの位置に地図の中心を設定
});

// スタート地点の座標を保持
var startLatLon;

// GPXデータの読み込みと表示
function loadGPX(file) {
	var reader = new FileReader();
	reader.onload = function(e) {
			var gpxContent = e.target.result;
			parseGPX(gpxContent);
	};
	reader.readAsText(file);
}

// GPXファイルの読み込みと解析
// function readGPX(file) {
//     var reader = new FileReader();
//     reader.onload = function(e) {
//         var gpxContent = e.target.result;
//         parseGPX(gpxContent);
//     };
//     reader.readAsText(file);
// }

// GPXファイルの解析
function parseGPX(gpxContent) {
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(gpxContent, "text/xml");
	var trkpts = xmlDoc.getElementsByTagName("trkpt");

	// // 座標点の配列を初期化
	// var latLngs = [];

	// for (var i = 0; i < trkpts.length; i++) {
	// 	var lat = trkpts[i].getAttribute("lat");
	// 	var lon = trkpts[i].getAttribute("lon");
	// 	// console.log("Latitude:", lat, "Longitude:", lon);
	// 	// 座標をLatLngオブジェクトに変換し、配列に追加
	// 	latLngs.push([lat, lon]);
	// 	// Polylineを作成し、地図に追加
	// 	var polyline = L.polyline(latLngs, {smoothFactor: 5}).addTo(map);
	// }
	// マーカーの移動
	var index = 0;
	var totalDistance = 0; // トータルの距離を格納する変数を追加
	var lastLatLon = L.latLng(36.1772, 137.9547)
	var previousMarkerDistance = 0; // 前のマーカーが設置された距離を格納する変数を追加

	function moveMarker() {
		if (index < trkpts.length - 1) { // 最後のトラックポイントまで処理するためにインデックスを調整
			var lat1 = parseFloat(trkpts[index].getAttribute("lat"));
			var lon1 = parseFloat(trkpts[index].getAttribute("lon"));
			var lat2 = parseFloat(trkpts[index + 1].getAttribute("lat")); // 次のトラックポイントの座標を取得
			var lon2 = parseFloat(trkpts[index + 1].getAttribute("lon")); // 次のトラックポイントの座標を取得
			var currentLatLon = L.latLng(lat2, lon2); // 次のトラックポイントの座標を使用

			// 最初のポイントなら、スタート地点を設定
			if (index === 0) {
				startLatLon = currentLatLon;
				// 最初のポイントでマーカーを配置
				marker.setLatLng(currentLatLon);
			}

			marker.setLatLng(currentLatLon);

			// 2点間の距離を計算し、トータルの距離に追加
			var distance = lastLatLon.distanceTo(currentLatLon); // メートルでの距離を取得

			if (distance < 50){
				totalDistance += distance; // トータルの距離に加算
			}
			
			// 1kmごとにマーカーポイントを設置
			if (totalDistance - previousMarkerDistance >= 1000) {
				// マーカーを設置
				var markerPoint = L.marker(currentLatLon).addTo(map);
				markerPoint.bindPopup("1km reached from start").openPopup();
				previousMarkerDistance = totalDistance; // 前のマーカーが設置された距離を更新
			}

			// ポップアップの内容を更新
			setTimeout(function() {
				marker.bindPopup("Total distance: " + totalDistance.toFixed(2) + " meters").openPopup();
			}, 1000); // 1秒ごとに更新
			// // ポップアップの内容を更新
			// popup.setLatLng(currentLatLon)
			// .setContent("Distance from start: " + distance + " meters")
			// .openPopup();

			index++;
			lastLatLon = currentLatLon
			setTimeout(moveMarker, 50); // 0.1秒ごとに更新
		}
	}
	moveMarker();
	
}

// // ファイル選択要素の参照を取得
// var fileInput = document.getElementById('fileInput');

// // ファイルが選択されたときに実行される関数を定義
// fileInput.addEventListener('change', function(event) {
//     // 選択されたファイルの情報を取得
//     var selectedFile = event.target.files[0];
    
//     // GPXファイルの読み込みと解析を実行
//     readGPX(selectedFile);
// });

// ファイル選択要素の参照を取得
var fileInput = document.getElementById('fileInput');

// ファイルが選択されたときに実行される関数を定義
fileInput.addEventListener('change', function(event) {
    // 選択されたファイルの情報を取得
    var selectedFile = event.target.files[0];
    
    // GPXファイルの読み込みと表示を実行
    loadGPX(selectedFile);
});
