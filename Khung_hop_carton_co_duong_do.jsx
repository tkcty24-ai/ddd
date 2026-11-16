#target illustrator

(function () {
    // =====================================
    // 1. HÀM HỖ TRỢ
    // =====================================

    var MM = 2.834645669; // mm sang point

    function mm(v) {
        return v * MM;
    }

    function rgb(r, g, b) {
        var c = new RGBColor();
        c.red = r;
        c.green = g;
        c.blue = b;
        return c;
    }

    function formatNumber(value) {
        var s = (Math.round(value * 100) / 100).toFixed(2);
        s = s.replace(/\.?0+$/, "");
        return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function addLine(layer, x1, y1, x2, y2, color, width) {
        var p = layer.pathItems.add();
        p.setEntirePath([[x1, y1], [x2, y2]]);
        p.filled = false;
        p.stroked = true;
        p.strokeColor = color;
        p.strokeWidth = width || 0.25;
        return p;
    }

    function addText(layer, content, x, y, size, color, bold, rotation) {
        var tf = layer.textFrames.add();
        tf.contents = content;
        tf.position = [x, y];

        var tr = tf.textRange;
        tr.characterAttributes.size = size || 12;
        tr.characterAttributes.fillColor = color;
        tr.characterAttributes.textFont = bold
            ? app.textFonts.getByName("Arial-BoldMT")
            : app.textFonts.getByName("ArialMT");

        if (rotation) tf.rotate(rotation);
        return tf;
    }

    function horizontalDimension(layer, x1, x2, yRef, yDim, label, color, fontSize) {
        // Đường dóng
        addLine(layer, x1, yRef, x1, yDim, color, 0.25);
        addLine(layer, x2, yRef, x2, yDim, color, 0.25);

        // Đường kích thước và hai vạch chéo ở đầu
        addLine(layer, x1, yDim, x2, yDim, color, 0.25);
        var tick = mm(2.2);
        addLine(layer, x1 - tick / 2, yDim - tick, x1 + tick / 2, yDim + tick, color, 0.25);
        addLine(layer, x2 - tick / 2, yDim - tick, x2 + tick / 2, yDim + tick, color, 0.25);

        var tf = addText(layer, label, 0, 0, fontSize || 11, color, false, 0);
        // Canh giữa nhãn theo chiều ngang
        var b = tf.visibleBounds;
        var w = b[2] - b[0];
        tf.position = [(x1 + x2 - w) / 2, yDim + mm(2.2)];
        return tf;
    }

    function verticalDimension(layer, y1, y2, xRef, xDim, label, color, fontSize) {
        // Đường dóng
        addLine(layer, xRef, y1, xDim, y1, color, 0.25);
        addLine(layer, xRef, y2, xDim, y2, color, 0.25);

        // Đường kích thước và hai vạch chéo
        addLine(layer, xDim, y1, xDim, y2, color, 0.25);
        var tick = mm(2.2);
        addLine(layer, xDim - tick, y1 - tick / 2, xDim + tick, y1 + tick / 2, color, 0.25);
        addLine(layer, xDim - tick, y2 - tick / 2, xDim + tick, y2 + tick / 2, color, 0.25);

        var tf = addText(layer, label, 0, 0, fontSize || 11, color, false, 90);
        var b = tf.visibleBounds;
        var h = b[3] - b[1];
        // Đặt nhãn ở giữa đoạn đo, lệch ra ngoài đường kích thước
        tf.position = [xDim + mm(3.5), (y1 + y2) / 2 + h / 2];
        return tf;
    }

    // =====================================
    // 2. HỘP THOẠI NHẬP KÍCH THƯỚC
    // =====================================

    var dlg = new Window("dialog", "TAO KHUNG HOP CARTON");
    dlg.orientation = "column";
    dlg.alignChildren = "fill";

    dlg.add("statictext", undefined, "NHAP THONG TIN HOP (DON VI: mm)");

    var fields = {};

    function addInput(label, value, description) {
        var g = dlg.add("group");
        g.add("statictext", undefined, label);
        var input = g.add("edittext", undefined, value);
        input.characters = 16;
        fields[label] = input;
        if (description) g.add("statictext", undefined, description);
    }

    addInput("Ten thung", "CUP PORTION 2Z BLACK");
    addInput("Dai (L)", "405");
    addInput("Rong (W)", "250");
    addInput("Cao (H)", "320");
    addInput("Nap (F)", "125", "De trong = W/2");
    addInput("Tai dan (G)", "30");

    var buttons = dlg.add("group");
    buttons.alignment = "center";
    buttons.add("button", undefined, "TAO KHUNG", { name: "ok" });
    buttons.add("button", undefined, "HUY", { name: "cancel" });

    if (dlg.show() != 1) return;

    // =====================================
    // 3. LẤY VÀ KIỂM TRA THÔNG SỐ
    // =====================================

    var boxName = fields["Ten thung"].text;
    if (boxName === "") boxName = "HOP CARTON";

    var L = Number(fields["Dai (L)"].text);
    var W = Number(fields["Rong (W)"].text);
    var H = Number(fields["Cao (H)"].text);
    var F = fields["Nap (F)"].text === "" ? W / 2 : Number(fields["Nap (F)"].text);
    var G = Number(fields["Tai dan (G)"].text);

    if (!isFinite(L) || !isFinite(W) || !isFinite(H) ||
        !isFinite(F) || !isFinite(G) ||
        L <= 0 || W <= 0 || H <= 0 || F <= 0 || G <= 0) {
        alert("Vui long nhap kich thuoc hop hop le!");
        return;
    }

    // =====================================
    // 4. TÍNH KÍCH THƯỚC BẢN TRẢI VÀ KHỔ TÀI LIỆU
    // =====================================

    var totalWidth = 2 * (L + W) + G;
    var totalHeight = 2 * F + H;

    // Chừa khoảng trống cho tiêu đề và đường đo
    var marginLeft = 65;
    var marginRight = 65;
    var marginTop = 85;
    var marginBottom = 45;

    var docWidth = mm(marginLeft + totalWidth + marginRight);
    var docHeight = mm(marginTop + totalHeight + marginBottom);

    var doc = app.documents.add(DocumentColorSpace.RGB, docWidth, docHeight);
    doc.rulerUnits = RulerUnits.Millimeters;

    // =====================================
    // 5. TẠO LAYER
    // =====================================

    var boxLayer = doc.layers[0];
    boxLayer.name = "01 - KHUNG HOP CARTON";

    var dimLayer = doc.layers.add();
    dimLayer.name = "02 - DUONG DO KICH THUOC";

    var titleLayer = doc.layers.add();
    titleLayer.name = "03 - TEN THUNG";

    // =====================================
    // 6. TỌA ĐỘ BẢN TRẢI
    // =====================================

    var x0 = mm(marginLeft + G);
    var y0 = docHeight - mm(marginTop);

    // 4 mặt thân hộp: L - W - L - W
    var x1 = x0 + mm(L);
    var x2 = x1 + mm(W);
    var x3 = x2 + mm(L);
    var x4 = x3 + mm(W);

    // Các hàng: nắp trên - thân - nắp dưới
    var y1 = y0 - mm(F);
    var y2 = y1 - mm(H);
    var y3 = y2 - mm(F);

    // =====================================
    // 7. HÀM VẼ HÌNH CHỮ NHẬT
    // =====================================

    function drawRect(layer, top, left, width, height, fillColor, strokeColor, strokeWidth) {
        var rect = layer.pathItems.rectangle(top, left, width, height);
        rect.filled = true;
        rect.fillColor = fillColor;
        rect.stroked = true;
        rect.strokeColor = strokeColor;
        rect.strokeWidth = mm(strokeWidth);
        return rect;
    }

    var whiteColor = rgb(255, 255, 255);
    var outlineColor = rgb(125, 125, 125);

    var panelX = [x0, x1, x2, x3];
    var panelWidths = [mm(L), mm(W), mm(L), mm(W)];

    // =====================================
    // 8. VẼ CÁC MẶT HỘP
    // =====================================

    // Tai dán
    drawRect(boxLayer, y1, x0 - mm(G), mm(G), mm(H),
        whiteColor, outlineColor, 0.25);

    // 4 mặt thân
    for (var i = 0; i < 4; i++) {
        drawRect(boxLayer, y1, panelX[i], panelWidths[i], mm(H),
            whiteColor, outlineColor, 0.25);
    }

    // 4 nắp trên
    for (var j = 0; j < 4; j++) {
        drawRect(boxLayer, y0, panelX[j], panelWidths[j], mm(F),
            whiteColor, outlineColor, 0.25);
    }

    // 4 nắp dưới
    for (var k = 0; k < 4; k++) {
        drawRect(boxLayer, y2, panelX[k], panelWidths[k], mm(F),
            whiteColor, outlineColor, 0.25);
    }

    // =====================================
    // 9. TIÊU ĐỀ TÊN THÙNG
    // =====================================

    var blackColor = rgb(35, 31, 32);
    addText(titleLayer, boxName.toUpperCase(), mm(20),
        docHeight - mm(18), 18, blackColor, true, 0);

    // =====================================
    // 10. ĐƯỜNG ĐO KÍCH THƯỚC
    // =====================================

    var redColor = rgb(255, 0, 0);

    // Đo ngang: tổng chiều dài bản trải
    horizontalDimension(dimLayer, x0 - mm(G), x4, y0,
        y0 + mm(20), formatNumber(totalWidth), redColor, 100);

    // Đo các đoạn đầu giống bố cục mẫu: tai dán, L, W
    horizontalDimension(dimLayer, x0 - mm(G), x0, y0,
        y0 + mm(9), String(G), redColor, 100);
    horizontalDimension(dimLayer, x0, x1, y0,
        y0 + mm(9), String(L), redColor, 100);
    horizontalDimension(dimLayer, x1, x2, y0,
        y0 + mm(9), String(W), redColor, 100);

    // Đo dọc tổng chiều cao ở bên trái
    verticalDimension(dimLayer, y3, y0, x0 - mm(G),
        x0 - mm(35), formatNumber(totalHeight),
        redColor, 100);

    // Đo từng phần ở bên phải: nắp - thân - nắp
    verticalDimension(dimLayer, y1, y0, x4,
        x4 + mm(20), String(F), redColor, 100);
    verticalDimension(dimLayer, y2, y1, x4,
        x4 + mm(20), String(H), redColor, 100);
    verticalDimension(dimLayer, y3, y2, x4,
        x4 + mm(20), String(F), redColor, 100);

    // =====================================
    // 11. THÔNG BÁO KẾT QUẢ
    // =====================================

    alert(
        "DA TAO KHUNG HOP VA DUONG DO KICH THUOC!\n\n" +
        "Ten thung: " + boxName + "\n" +
        "Kich thuoc ban trai: " + totalWidth.toFixed(2) + " x " +
        totalHeight.toFixed(2) + " mm\n\n" +
        "Dai (L): " + L + " mm\n" +
        "Rong (W): " + W + " mm\n" +
        "Cao (H): " + H + " mm\n" +
        "Nap (F): " + F + " mm\n" +
        "Tai dan (G): " + G + " mm\n\n" +
        "Duong do, ten thung va khung hop duoc tach thanh 3 layer rieng."
    );

})();
