class MapMake {
    constructor() {
        this.stackLapInfoValue = null;
        this.map = L.map('mapcontainer', { zoomControl: false });
        this._mapContainer = document.getElementById('mapcontainer');
        this._mapWidth = this._mapContainer.clientWidth;
        this.marker = L.marker([0, 0]).addTo(this.map);
        this.CurrentInfoContainer = L.DomUtil.create('div');
        this.isMarkerStart = false;
        this.isPaused = false;
        this.isFinished = false;
        this.CurrentInfo = null;
        this.mapInfoID = null;
        this.circles = [];
    }

    initializeMap(){
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: "© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        }).addTo(this.map);

        // // カスタムアイコンの定義
        // var customIcon = L.icon({
        //     iconUrl: 'markerIcon.png', // アイコンの画像ファイルのパス
        //     iconSize: [32, 32], // アイコンのサイズ [幅, 高さ]（ピクセル）
        //     iconAnchor: [16, 32], // アイコンの基準点の位置 [アイコンの幅の半分, アイコンの高さ]
        //     popupAnchor: [0, -32], // ポップアップがアイコンのどの部分に配置されるか [横方向のオフセット, 縦方向のオフセット]（ピクセル）
        // });

        // var polygon = L.polygon([
        //     [35.681236, 139.767125],
        //     [35.681236-0.001, 139.767125+0.001],
        //     [35.681236+0.001, 139.767125+0.001]
        // ], {
        //     color: 'blue',  // 枠線の色
        //     fillColor: 'yellow',  // 塗りつぶしの色
        //     fillOpacity: 0.5,  // 塗りつぶしの透明度
        //     smoothFactor: 10 
        // }).addTo(this.map);

        // // ポリゴンの座標
        // var polygonPoints = [
        //     [35.681236, 139.767125],
        //     [35.681236-0.001, 139.767125+0.001],
        //     [35.681236+0.001, 139.767125+0.001]
        // ];

        // // ポリゴンを作成
        // var polygon = L.polygon(polygonPoints, {
        //     color: 'red',
        //     fillColor: 'blue',
        //     fillOpacity: 0.5
        // });
        // // レイヤーグループを作成し、ポリゴンを追加
        // var layerGroup = L.layerGroup().addLayer(polygon).addTo(this.map);

        // // レイヤーグループを回転させる
        // layerGroup.setTransform('rotate(45deg)');

	    this.map.setView([35.681236, 139.767125], 13);
        this.addCurrentInfo();
        this.addMarkerEvent();
    }

    // カスタムコントロールを追加
    addCurrentInfo() {
        this.CurrentInfo = L.Control.extend({
            onAdd: function() {
                var CurrentInfoContainer = L.DomUtil.create('div');
                CurrentInfoContainer.id = 'mapInfo';
                CurrentInfoContainer.innerHTML = 'Current Info';
                
                // イベントリスナーを追加しないことを確認するためにマウスイベントを無視します
                L.DomEvent.disableClickPropagation(CurrentInfoContainer);
                L.DomEvent.disableScrollPropagation(CurrentInfoContainer);

                return CurrentInfoContainer;
            }
        });
        
        // カスタムコントロールを地図に追加
        new this.CurrentInfo().addTo(this.map);

        this.mapInfoID = document.getElementById('mapInfo')
    }

    //markerのイベントを追加する
    addMarkerEvent(){
        this.stackLapInfoValue = parseGPX.stackLapInfoValue;
        this.setMarkerMoveEvent();
    }

    setMarkerMoveEvent(){
        if (!this.isPaused){
            this.marker.on('move', (event) => {
                if (!this.isPaused){
                    this.markerMoveCenter()
                }
            });
        }
    }


    markerMoveCenter(){
        this.map.panTo(this.marker.getLatLng()); // マーカーの位置に地図の中心を設定
    }

    setMapView(LatLon, scale){
        this.map.setView(LatLon, scale);
    }

    setMarker(LatLon){
		this.marker.setLatLng(LatLon);
	}

    setMarkerEachKm(LapInfo, markerLapIndex){
        var circle = L.circleMarker(LapInfo[markerLapIndex]["座標"], {
            color: 'red', // 線の色
            fillColor: '#f03', // 塗りつぶしの色
            fillOpacity: 0.5, // 塗りつぶしの透明度
            radius: 10 // 円の半径（ピクセル）
        }).addTo(this.map);
        
        this.setPopUp(circle, LapInfo, markerLapIndex);
        // this.markerRemove();
    }

    setMarkerTracePoint(LatLon){
        var circle = L.circleMarker(LatLon, {
            color: 'rgba(0, 191, 255, 0.5)', // 線の色
            fillColor: 'rgba(0, 191, 255, 0.5)', // 塗りつぶしの色
            radius: 1 // 円の半径（ピクセル）
        }).addTo(this.map);
    }

    setPopUp(circle, LapInfo, markerLapIndex){

        var popupContent = "距離：" + LapInfo[markerLapIndex]["走行距離"];
			popupContent += "<br>ラップ：" + LapInfo[markerLapIndex]["Lap" + (markerLapIndex + 1)];

        var popup = L.popup({
            closeOnClick: false, // ポップアップがクリックされても閉じない
            autoClose: false,
            className: 'custom-popup'
        }).setContent(popupContent);

        circle.bindPopup(popup).openPopup();
        this.circles.push(circle);
    }

    markerRemove(){
        if (this.circles.length > 0){
            if (gpxTracerUI.slider.value < this.circles.length * 1000){
                var removedCircle = this.circles[this.circles.length - 1]; // 配列から最初のサークルを取得して削除
                this.circles.pop();
                this.map.removeLayer(removedCircle); // 地図からサークルを削除
                moveMarkerEvent.prevMarkerDistance = this.circles.length * 1000;
                moveMarkerEvent.markerLapIndex--;
            }
        }
    }

    clearAllMarker(){
        this.circles.forEach(circle => {
            this.map.removeLayer(circle);
        });
        this.circles = [];
    }

    setCurrentInfo(text, width, LatLon){
        this.mapInfoID.innerHTML = text;
        var margin = 30;
        this.mapInfoID.style.width = (width + margin) + 'px';

        var markerLatLng = LatLon;
        var markerPixelPoint = this.map.latLngToContainerPoint(markerLatLng);

        // // ピクセル座標を取得
        // var markerPixelX = markerPixelPoint.x;
        var offsetX = 100;
        var offsetY = 100;
        this.mapInfoID.style.top = (markerPixelPoint.y - offsetY) + 'px';
        this.mapInfoID.style.right = (markerPixelPoint.x - offsetX) + 'px';
    }

    setStartPoint(startLatLon){
        var customIcon = L.divIcon({
            className: 'startMarker-icon', // カスタムアイコンのクラス名
            html: '<div class="startMarker-text">S</div>', // テキストを含むHTML
            iconSize: [30, 30], // アイコンのサイズ [横幅, 縦幅]（ピクセル）
            iconAnchor: [15, 30], // アイコンの基準点の位置 [アイコンの横幅の半分, アイコンの縦幅]
        });

        L.marker(startLatLon, { icon: customIcon }).addTo(this.map);
    }

    setGoalPoint(goalLatLon){
        var customIcon = L.divIcon({
            className: 'goalMarker-icon', // カスタムアイコンのクラス名
            html: '<div class="goalMarker-text">G</div>', // テキストを含むHTML
            iconSize: [30, 30], // アイコンのサイズ [横幅, 縦幅]（ピクセル）
            iconAnchor: [15, 30], // アイコンの基準点の位置 [アイコンの横幅の半分, アイコンの縦幅]
        });

        L.marker(goalLatLon, { icon: customIcon }).addTo(this.map);
    }


}


class GPXTracerUI{
    constructor() {
        this.moveMarkerEvent = moveMarkerEvent;

        this.slider = document.getElementById('distanceSlider');
        this.pauseButton = document.getElementById('pauseButton');
        this.speedUpButton = document.getElementById('speedUpButton');
        this.speedDownButton = document.getElementById('speedDownButton');
        this.speedInputBox = document.getElementById('speedInputBox');
        
        this.dataAnalysisValue = null;
        this.stackLapInfoValue = null;

        this._markerSpeedRatio = 100;
        this._speedRatioElement = [1,10,50,100,200,500,1000,2000,30];
        this._speedRatioElementIndex = 3;
    }

    initialzeUI() {
        this.slider.style.width = mapMake._mapWidth + 'px';
        this.pauseButtonClickEvent();
        this.speedUpButtonEvent();
        this.speedDownButtonEvent();
    }

    pauseButtonClickEvent(){
        // 一時停止ボタンのクリックイベントを追加
        this.pauseButton.addEventListener('click', () => {
            // startButtonClick();
            if (!mapMake.isMarkerStart){
                this.markerStartClicked();
            }
            else{
                this.pauseRestartClicked();
            }
        });
    }

    markerStartClicked(){
        if (!mapMake.isFinished){
            mapMake.isMarkerStart = true;
            this.pauseButton.textContent = '一時停止';
            moveMarkerEvent.initializeMoveMarker();
        }
        else{
            mapMake.isMarkerStart = true;
            mapMake.isPaused = false;
            mapMake.isFinished = false;
            this.pauseButton.textContent = '一時停止';
            moveMarkerEvent.dataAnalysisValue = new DataAnalysisValue();
            mapMake.clearAllMarker();
            moveMarkerEvent.initializeConstractor();
            moveMarkerEvent.initializeMoveMarker();
        }
        
    }

    pauseRestartClicked(){
        mapMake.isPaused = !mapMake.isPaused;
            if (mapMake.isPaused){
                this.pauseButton.textContent = '　再開　';
            }
            else{
                this.pauseButton.textContent = '一時停止';
            }
    }

    makeUIafterFileLoaded(){
        this.pauseButton.disabled = false;
    }

    setSlider(sliderValueMax){
        this.slider.disabled = false;
        this.slider.max = sliderValueMax;
        this.setSliderContainer(sliderValueMax);
        this.setSliderEvent();
    }

    setSliderContainer(sliderValueMax){
        var sliderContainer = document.getElementById('sliderContainer');
        this.setSliderScale(sliderContainer,sliderValueMax);

    }

    setSliderScale(sliderContainer,sliderValueMax){

        // 1kmごとのメモリを描画
        for (var i = 0; i <= sliderValueMax; i += 1000) {
            var tick = document.createElement('div');
            
            tick = this.setSliderScaleBar(i, tick, sliderValueMax);
            
            // 5kmごとに距離表示
            if (i % 5000 === 0){
                var text = this.setSlideText(i, tick);
                tick.appendChild(text);
            }
            
            sliderContainer.appendChild(tick);
        }

        
    }

    setSliderScaleBar(i, tick, sliderValueMax){
        tick.value = 1000
        tick.style.position = 'absolute';
        tick.style.marginLeft = (this.slider.offsetLeft + 12) + 'px';
        tick.style.left = (i / sliderValueMax) * (this.slider.offsetWidth - this.slider.offsetLeft) + 'px'; // スライダーバーの位置に合わせてメモリを配置
        tick.style.width = '1px'; // メモリの幅を設定
        tick.style.height = '8px'; // メモリの高さを設定
        tick.style.background = '#000'; // メモリの色を設定
        tick.style.top = ((this.slider.offsetTop + this.slider.offsetHeight / 2) - (12 + 8 + 5)) + 'px'; // メモリの位置を調整
        return tick;
    }

    setSlideText(i){
        if (i % 1000 === 0) {
			var text = document.createElement('span');
			text.textContent = (i / 1000) + 'km';
			text.style.position = 'absolute';
			text.style.top = '-20px'; // テキストの位置を調整
			text.style.left = '-20px'; // テキストの位置を調整
			text.style.fontSize = '12px';

			document.body.appendChild(text);
			var width = text.offsetWidth; // span要素の横幅を取得
			document.body.removeChild(text); // span要素を削除

			text.style.marginLeft = (this.slider.offsetLeft + 12 - width/2) + 'px';
            
            return text;
		}
    }

    setSliderValue(sliderValue){
        this.slider.value = sliderValue;
    }

    setSliderEvent(){
        this.dataAnalysisValue = moveMarkerEvent.dataAnalysisValue;
        this.stackLapInfoValue = parseGPX.stackLapInfoValue;
        
        this.slider.addEventListener('input', () => {
            var sliderValue = parseInt(this.slider.value); // スライダーの値を取得
            var latLngIndex = this.stackLapInfoValue.indexDistance[sliderValue];
            this.setMarkerFromSlider(sliderValue, latLngIndex);
            this.dataAnalysisValue.totalDistance = sliderValue;
            this.dataAnalysisValue.totalTime = this.stackLapInfoValue.indexTime[this.dataAnalysisValue.index];
            this.dataAnalysisValue.prevTime = new Date(parseGPX._trkpts[this.dataAnalysisValue.index-1].
                                            getElementsByTagName("time")[0].textContent).getTime();
            mapMake.markerMoveCenter();
            mapMake.markerRemove();
        });

    }

    setMarkerFromSlider(sliderValue, latLngIndex){
        latLngIndex = this.stackLapInfoValue.indexDistance[sliderValue];
        if (latLngIndex) {
                var lat = parseFloat(parseGPX._trkpts[latLngIndex].getAttribute("lat"));
                var lon = parseFloat(parseGPX._trkpts[latLngIndex].getAttribute("lon"));
                var markerLatLon = L.latLng(lat, lon); // 座標を作成
                
                this.dataAnalysisValue.currentLatLon = markerLatLon;
                this.dataAnalysisValue.index = latLngIndex;
    
                mapMake.setMarker(markerLatLon);
                // map.panTo(markerLatLon); // マーカーが表示される位置に地図を移動
        }
        else{
            sliderValue++;
            this.setMarkerFromSlider(sliderValue, latLngIndex);
        }
        moveMarkerEvent.currentInfoDisplay();
    }

    compareSliderValue(sign, value){
        switch (sign) {
            case '>':
                return this.slider.value > value;
            case '<':
                return this.slider.value < value;
            default:
                return false;
        }
    }

    speedUpButtonEvent(){
        this.speedUpButton.addEventListener('click', () => {
            if (this._speedRatioElementIndex < this._speedRatioElement.length -1 ){
                this._speedRatioElementIndex ++;
                this.speedInputBox.value = this._speedRatioElement[this._speedRatioElementIndex];
            }
        });
    }

    speedDownButtonEvent(){
        this.speedDownButton.addEventListener('click', () => {
            if (this._speedRatioElementIndex > 0 ){
                this._speedRatioElementIndex --;
                this.speedInputBox.value = this._speedRatioElement[this._speedRatioElementIndex];
            }
        });
    }
}

class DataAnalysisValue{
    constructor(){
        this.index = 0;
        this.totalDistance = 0;
        this.totalTime = 0;
        this.currentLatLon = null;
        this.lastLatLon = null;
        this.prevTime = null;
    }
}

class StackLapInfoValue{
    constructor(){
        this.minTime = Infinity;
        this.minIndex = -1;
        this.previousDistance=0;
        this.previousLapTime = 0;
        this.indexDistance = {};
        this.indexTime = {};
        this.LapInfo = [];
    }
}

class CheckCalcClassValue{
    constructor(){
        this.dataAnalysisValue = null;
        this.stackLapInfoValue = null;
    }

    classValueReset(){
        this.dataAnalysisValueReset;
        this.stackLapInfoValueReset;
    }

    dataAnalysisValueReset(){
        this.dataAnalysisValue = new DataAnalysisValue();
    }

    stackLapInfoValueReset(){
        this.stackLapInfoValue = new StackLapInfoValue();
    }

    calcPreviousMarkDistance(sign,value){
        switch (sign){
            case '=':
                this.stackLapInfoValue.prevMarkerDistance = value;
        }
        
    }
}

class ParseGPX{
    constructor(){
        this.dataAnalysisValue = new DataAnalysisValue();
        this.stackLapInfoValue = new StackLapInfoValue();
        this._startLatLon = null;
           
        this.prevMarkerDistance = 0;
        this.markerLapIndex = 0;
        
        
        this.fileInput = document.getElementById('fileInput');
        this._parser = null;
	    this._xmlDoc = null;
	    this._trkpts = null;
	    this.previousDistance = 0;

        this._totalIndex = 0;
        this._finishTotalTime = null;
	    
    }

    initializeParseGPX(){
        checkCalcClassValue.classValueReset();
        this.fileLoaded();
    }

    fileLoaded(){
        // ファイルが選択されたときに実行される関数を定義
        this.fileInput.addEventListener('change', (event) => {
        // 選択されたファイルの情報を取得
        var selectedFile = event.target.files[0];
        gpxTracerUI.makeUIafterFileLoaded();    //スタートボタンを有効にする
        // GPXファイルの読み込みと表示を実行
        this.loadGPX(selectedFile);
        });
    }

    // GPXデータの読み込みと表示
    loadGPX(file) {
        var reader = new FileReader();
        reader.onload = (e) => {
                var gpxContent = e.target.result;
                this.parseGPXContent(gpxContent);
        };
        reader.readAsText(file);
    }

    parseGPXContent(gpxContent){
        this._parser = new DOMParser();
	    this._xmlDoc = this._parser.parseFromString(gpxContent, "text/xml");
	    this._trkpts = this._xmlDoc.getElementsByTagName("trkpt");
        this.initialMapDisplay();
        this.dataAnalysis();
        mapMake.setGoalPoint(this.dataAnalysisValue.currentLatLon);
        gpxTracerUI.setSlider(this.dataAnalysisValue.totalDistance);
    }

    initialMapDisplay(){
        var startLat = parseFloat(this._trkpts[0].getAttribute("lat"));
		var startLon = parseFloat(this._trkpts[0].getAttribute("lon"));
        this.dataAnalysisValue.prevTime = new Date(this._trkpts[0].getElementsByTagName("time")[0].textContent).getTime();
        this._startLatLon = L.latLng(startLat, startLon);
        this.dataAnalysisValue.lastLatLon = this._startLatLon;
        mapMake.setMapView(this._startLatLon, 15);
        this.initialsetMarker();
        mapMake.setStartPoint(this._startLatLon);
    }

    initialsetMarker(){
        mapMake.setMarker(this._startLatLon);
    }

    dataAnalysis(){

		this.dataAnalysisEachPoint(this.dataAnalysisValue);
		this.stackDistancetoLatLon();
		this.stackLapInfo();
        this.tracePoint();

		if (this.dataAnalysisValue.index < this._trkpts.length - 1) { 
			this.dataAnalysis();
		}

        this._totalIndex = this.dataAnalysisValue.index;
        this._finishTotalTime = this.dataAnalysisValue.totalTime;

    }

    dataAnalysisEachPoint(classValue){
    
        var lat = parseFloat(this._trkpts[classValue.index].getAttribute("lat"));
        var lon = parseFloat(this._trkpts[classValue.index].getAttribute("lon"));
        classValue.currentLatLon = L.latLng(lat, lon); 

        var distance = classValue.lastLatLon.distanceTo(classValue.currentLatLon);
        classValue.totalDistance = this.totalDistanceCalc(classValue,distance);

        var thisTime = new Date(this._trkpts[classValue.index].getElementsByTagName("time")[0].textContent).getTime();
        this.totalTimeCalc(classValue,thisTime);

        this.updateGPXData(classValue,thisTime);
  
    }

    totalDistanceCalc(classValue,distance){
        return distance < 50 ? classValue.totalDistance += distance : classValue.totalDistance;
    }

    totalTimeCalc(classValue,thisTime){
        if ((thisTime - classValue.prevTime) / 1000 < 300){
            classValue.totalTime += (thisTime - classValue.prevTime) / 1000;
        }
        return this.totalTime
    }

    updateGPXData(classValue, thisTime){
        classValue.lastLatLon = classValue.currentLatLon;
        classValue.prevTime = thisTime;
        classValue.index++;
    }

    stackDistancetoLatLon(){
        this.stackLapInfoValue.indexDistance[Math.floor(this.dataAnalysisValue.totalDistance)] = this.dataAnalysisValue.index;
        this.stackLapInfoValue.indexTime[this.dataAnalysisValue.index] = this.dataAnalysisValue.totalTime;
    }

    stackLapInfo(){
        // 1kmごとにマーカーポイントを設置
        if (this.checkDistanceEachKM(this.dataAnalysisValue.totalDistance)) {
            this.stackLapInfoValue.LapInfo.push({});
            var lapIndex = this.stackLapInfoValue.LapInfo.length - 1;
            var thisLapDistance = this.dataAnalysisValue.totalDistance - this.stackLapInfoValue.previousDistance;

            const valueConverter = new ValueConverter();
            var thisLapTime = ((this.dataAnalysisValue.totalTime - this.stackLapInfoValue.previousLapTime)
            /(valueConverter.distanceCalctoKm(thisLapDistance))).toFixed(2);
    
            this.stackLapDistance(lapIndex);
            this.stackLapTime(lapIndex, thisLapTime);
            this.stackLatoLon(lapIndex);
            this.checkAndUpdateMinTime(lapIndex, thisLapTime);
            this.stackDistancetoLatLon();

            this.stackLapInfoValue.previousDistance = this.dataAnalysisValue.totalDistance; // 前のマーカーが設置された距離を更新
            this.stackLapInfoValue.previousLapTime = this.dataAnalysisValue.totalTime;    //　ラップタイムのリセット
        }
        
    }

    checkDistanceEachKM(distance) {
        return distance >= (this.stackLapInfoValue.LapInfo.length+1) * 1000;
    }

    stackLapDistance(lapIndex){
        const valueConverter = new ValueConverter();
        this.stackLapInfoValue.LapInfo[lapIndex]["走行距離"] = 
        Math.floor(valueConverter.distanceCalctoKm(this.dataAnalysisValue.totalDistance)) + 'km';
    }

    stackLapTime(lapIndex, thisLapTime){
        var lapCount = lapIndex + 1;
        this.stackLapInfoValue.LapInfo[lapIndex]["Lap" + lapCount] = this.getThisLapTime(thisLapTime);
        // return thisLapTimeDisplay;
    }

    stackLatoLon(lapIndex){
        this.stackLapInfoValue.LapInfo[lapIndex]["座標"] = this.dataAnalysisValue.currentLatLon;
    }

    getThisLapTime(thisLapTIme){
        const valueConverter = new ValueConverter();
        return valueConverter.totalTimeHourMinSecDisplayCalc(thisLapTIme);
    }

    checkAndUpdateMinTime(lapIndex,thisLapTIme){
        if (thisLapTIme < this.stackLapInfoValue.minTime){
            this.stackLapInfoValue.minTime = this.getThisLapTime(thisLapTIme);
            this.stackLapInfoValue.minIndex = lapIndex;
        }
    }

    tracePoint(){
        if ((this.dataAnalysisValue.totalDistance - this.stackLapInfoValue.previousDistance) > 10){
            mapMake.setMarkerTracePoint(this.dataAnalysisValue.currentLatLon);
        }
    }
}

class MoveMarkerEvent{

    constructor(){
        this.dataAnalysisValue = new DataAnalysisValue();
        this.stackLapInfoValue = parseGPX.stackLapInfoValue;
        this.valueConverter = new ValueConverter();
        this.markerLapIndex = 0;
        this.prevMarkerDistance = 0;
    }

    initializeConstractor(){
        this.dataAnalysisValue = new DataAnalysisValue();
        this.stackLapInfoValue = parseGPX.stackLapInfoValue;
        this.valueConverter = new ValueConverter();
        this.markerLapIndex = 0;
        this.prevMarkerDistance = 0;
    }

    initializeMoveMarker(){
        this.dataAnalysisValue.lastLatLon = parseGPX._startLatLon;
        this.moveMarker();
    }

    moveMarker(){
        if (mapMake.isMarkerStart){
            if (!mapMake.isPaused){
                parseGPX.dataAnalysisEachPoint(this.dataAnalysisValue);
                this.currentInfoDisplay();
        }
        
        mapMake.setMarker(this.dataAnalysisValue.currentLatLon);
        this.checkandMarckEachKM();

        gpxTracerUI.setSliderValue(this.dataAnalysisValue.totalDistance);
        
        }

        if (this.dataAnalysisValue.index < parseGPX._trkpts.length - 1) { 
            var markerSpeedRatio = gpxTracerUI.speedInputBox.value;
            var markerSpeed = ((parseGPX._finishTotalTime / parseGPX._totalIndex) /markerSpeedRatio * 1000).toFixed(0);
			setTimeout(() => this.moveMarker(), markerSpeed); 
		}
        else{
            mapMake.isPaused = true;
            mapMake.isMarkerStart = false;
            mapMake.isFinished = true;
            gpxTracerUI.pauseButton.textContent = '最初から';
            setTimeout(() => this.moveMarker(), 50); 
        }
    
    }

    currentInfoDisplay(){

        var currentInfoElement = [this.valueConverter.distanceCalctoKm(this.dataAnalysisValue.totalDistance).toFixed(2) + "km",
        this.valueConverter.totalTimeHourMinSecDisplayCalc(this.dataAnalysisValue.totalTime)];  
        // 文字列を連結
        var currentInfoText = currentInfoElement.join("<br>");

        var longestText = currentInfoElement.reduce(function(longest, current) {
            return current.length > longest.length ? current : longest;
        }, '');

        var span = document.createElement('span');
        span.textContent = longestText;

        document.body.appendChild(span);
        var width = span.offsetWidth; // span要素の横幅を取得
        document.body.removeChild(span); // span要素を削除

        mapMake.setCurrentInfo(currentInfoText, width, this.dataAnalysisValue.currentLatLon);

    }

    checkandMarckEachKM(){
        // if (this.dataAnalysisValue.totalDistance - this.prevMarkerDistance >= 1000) {
        if (this.dataAnalysisValue.totalDistance >= (this.markerLapIndex+1)*1000) {
            mapMake.setMarkerEachKm(this.stackLapInfoValue.LapInfo, this.markerLapIndex);
            this.markerLapIndex++;
            this.prevMarkerDistance = this.dataAnalysisValue.totalDistance;
        }
    }

    setCurrentLatLonFromMarkerPosition(){

    }
    
}

class ValueConverter{
    distanceCalctoKm(distance){
        return (distance / 1000);
    }
    totalTimeHourMinSecDisplayCalc(time){
		//合計時間を時間、分、秒に換算
		var totalHour = Math.floor(time / (60 * 60));
		var totalHourDispay = totalHour>0? totalHour + "時間" : "";
		var totalMin = Math.floor((time - totalHour * 60 * 60) / 60);
		var totalMinDisplay = totalMin>0? totalMin + "分" : "";
		var totalSec = Math.floor(time - totalHour * 60 * 60 - totalMin * 60);
		var totalSecDisplay = totalSec + "秒"; 
		return totalHourDispay + totalMinDisplay + totalSecDisplay;
	}
}

const checkCalcClassValue = new CheckCalcClassValue();
const mapMake = new MapMake();
const gpxTracerUI = new GPXTracerUI();
const parseGPX = new ParseGPX();
var moveMarkerEvent = new MoveMarkerEvent();

checkCalcClassValue.classValueReset();
mapMake.initializeMap();
gpxTracerUI.initialzeUI();
parseGPX.initializeParseGPX();
