//#target illustrator

(function () {
    // =========================================================
    // TẠO KHUNG HỘP CARTON + TEM THÔNG TIN (CHUẨN TỈ LỆ & ĐÚNG BỐ CỤC MẪU 2)
    // =========================================================

    var MM = 2.834645669;
    function mm(v) { return v * MM; }

    function rgb(r, g, b) {
        var c = new RGBColor();
        c.red = r; c.green = g; c.blue = b;
        return c;
    }

    var BLACK = rgb(35, 35, 35);
    var WHITE = rgb(255, 255, 255);
    var BLUE = rgb(0, 55, 170);
    var RED = rgb(235, 20, 60);
    var DARKBLUE = rgb(45, 55, 150);
    var GREY = rgb(95, 105, 105);
    var LIGHTGREY = rgb(190, 190, 190);

    // ---------------------------------------------------------
    // 1. HỘP THOẠI NHẬP LIỆU
    // ---------------------------------------------------------
    var dlg = new Window("dialog", "TẠO KHUNG HỘP CARTON + TEM (CHUẨN TỈ LỆ)");
    dlg.orientation = "column";
    dlg.alignChildren = "fill";

    dlg.add("statictext", undefined, "KÍCH THƯỚC HỘP (mm)");
    var fields = {};

    function addInput(label, value, description) {
        var g = dlg.add("group");
        g.add("statictext", undefined, label);
        var input = g.add("edittext", undefined, value);
        input.characters = 13;
        fields[label] = input;
        if (description) g.add("statictext", undefined, description);
    }

    addInput("Dài (L)", "300");
    addInput("Rộng (W)", "200");
    addInput("Cao (H)", "150");
    addInput("Nắp (F)", "", "Để trống = W/2");
    addInput("Tai dán (G)", "30");

    dlg.add("panel");
    dlg.add("statictext", undefined, "THÔNG TIN TEM PHÍA TRÊN");
    addInput("Mã khách hàng", "167");
    addInput("Mã hàng", "167-");
    addInput("Phiên bản", "01");
    addInput("Tên sản phẩm", "359827");
    addInput("Kích thước phủ bì", "370x210x155");
    addInput("Khổ (mm)", "359");
    addInput("Dài bản trải (mm)", "1192");
    addInput("Loại carton", "3-ply corrugated carton");
    addInput("Người thiết kế", "Văn Hùng");
    addInput("Ngày", "06/03/2026");
    addInput("Logo", "NEWPACK");

    dlg.add("statictext", undefined, "Tùy chọn sóng & loại hộp (Vùng SÓNG):");
    var waveGroup = dlg.add("group");
    var waveFlat = waveGroup.add("checkbox", undefined, "Lần phẳng");
    var waveDouble = waveGroup.add("checkbox", undefined, "Lần đôi");
    var waveNone = waveGroup.add("checkbox", undefined, "Không lần");
    waveFlat.value = true;

    var procGlue = waveGroup.add("checkbox", undefined, "Hộp liền");
    var procJoin = waveGroup.add("checkbox", undefined, "Hộp ghép");
    var procVach = waveGroup.add("checkbox", undefined, "Vách");
    var procLot = waveGroup.add("checkbox", undefined, "Lót");
    procGlue.value = true;

    dlg.add("statictext", undefined, "Quy trình sản xuất:");
    var procGroup1 = dlg.add("group");
    var procFlap = procGroup1.add("checkbox", undefined, "Bổ chạp");
    var procBe = procGroup1.add("checkbox", undefined, "Bế");
    var procGlue2 = procGroup1.add("checkbox", undefined, "Hộp dán");
    var procStaple = procGroup1.add("checkbox", undefined, "Hộp ghim");
    procFlap.value = true;
    procGlue2.value = true;

    var buttons = dlg.add("group");
    buttons.alignment = "center";
    buttons.add("button", undefined, "TẠO KHUNG + TEM", { name: "ok" });
    buttons.add("button", undefined, "HỦY", { name: "cancel" });

    if (dlg.show() != 1) return;

    function val(label) { return fields[label].text; }
    function num(label) { return Number(val(label)); }

    var L = num("Dài (L)");
    var W = num("Rộng (W)");
    var H = num("Cao (H)");
    var F = val("Nắp (F)") === "" ? W / 2 : num("Nắp (F)");
    var G = num("Tai dán (G)");

    if (!isFinite(L) || !isFinite(W) || !isFinite(H) ||
        !isFinite(F) || !isFinite(G) ||
        L <= 0 || W <= 0 || H <= 0 || F <= 0 || G <= 0) {
        alert("Vui lòng nhập kích thước hộp hợp lệ!");
        return;
    }

    // ---------------------------------------------------------
    // 2. TÍNH TỶ LỆ VÀ KÍCH THƯỚC ARTBOARD (ĐƠN VỊ: MM)
    // ---------------------------------------------------------
    var totalWidth = 2 * (L + W) + G;
    var totalHeight = 2 * F + H;

    var scale = totalWidth / 1000;

    var margin = 15; 
    var labelH = totalWidth / 7.629; 
    var gapLabelBox = 60; 

    var docWidthMM = totalWidth + 70 + margin * 2;
    var docHeightMM = labelH + gapLabelBox + totalHeight + margin * 2;

    var doc = app.documents.add(DocumentColorSpace.RGB, mm(docWidthMM), mm(docHeightMM));
    doc.rulerUnits = RulerUnits.Millimeters;

    // ---------------------------------------------------------
    // 3. LAYER
    // ---------------------------------------------------------
    var labelLayer = doc.layers[0];
    labelLayer.name = "01 - TEM THÔNG TIN";
    var boxLayer = doc.layers.add();
    boxLayer.name = "02 - KHUNG HỘP CARTON";

    // ---------------------------------------------------------
    // 4. HÀM VẼ HỖ TRỢ
    // ---------------------------------------------------------
    function rectMM(layer, xMM, yMM, wMM, hMM, fill, stroke, sw) {
        var p = layer.pathItems.rectangle(mm(yMM), mm(xMM), mm(wMM), mm(hMM));
        p.filled = true;
        p.fillColor = fill || WHITE;
        p.stroked = true;
        p.strokeColor = stroke || BLACK;
        p.strokeWidth = sw !== undefined ? sw : 0.35;
        return p;
    }

    function lineMM(layer, x1, y1, x2, y2, color, sw) {
        var p = layer.pathItems.add();
        p.setEntirePath([[mm(x1), mm(y1)], [mm(x2), mm(y2)]]);
        p.filled = false;
        p.stroked = true;
        p.strokeColor = color || BLACK;
        p.strokeWidth = sw || 0.35;
        return p;
    }

    function textMM(layer, str, xMM, yMM, sizePt, bold, color, justification) {
        var tf = layer.textFrames.add();
        tf.contents = String(str);
        tf.position = [mm(xMM), mm(yMM)];
        var ca = tf.textRange.characterAttributes;
        ca.size = sizePt;
        ca.fillColor = color || BLACK;
        try {
            ca.textFont = app.textFonts.getByName(bold ? "Arial-BoldMT" : "ArialMT");
        } catch (e) {
            try { ca.textFont = app.textFonts.getByName("Arial"); } catch (e2) {}
        }
        if (justification) {
            try { tf.textRange.paragraphAttributes.justification = justification; } catch (e3) {}
        }
        return tf;
    }

    function centeredTextMM(layer, str, xMM, yMM, wMM, hMM, sizePt, bold, color) {
        var cx = xMM + wMM / 2;
        var fsScaled = sizePt * scale;
        var cy = yMM - (hMM / 2) + (fsScaled * 0.35 / MM); 
        return textMM(layer, str, cx, cy, sizePt, bold, color, Justification.CENTER);
    }

    function checkboxMM(layer, xMM, yMM, sMM, label, checked, fontSizePt) {
        // Ô vuông Checkbox nét đậm
        rectMM(layer, xMM, yMM, sMM, sMM, WHITE, BLACK, 0.7);
        if (checked) {
            lineMM(layer, xMM + sMM * 0.18, yMM - sMM * 0.55,
                   xMM + sMM * 0.42, yMM - sMM * 0.82, BLACK, 1.2);
            lineMM(layer, xMM + sMM * 0.42, yMM - sMM * 0.82,
                   xMM + sMM * 0.88, yMM - sMM * 0.18, BLACK, 1.2);
        }
        // Nhãn văn bản đi kèm
        textMM(layer, label, xMM + sMM + 2.5 * scale, yMM - sMM * 0.15 - (fontSizePt * 0.35 / MM),
               fontSizePt || 8.0, true, BLACK);
    }

    // ---------------------------------------------------------
    // 5. TỌA ĐỘ VÀ VẼ TEM THÔNG TIN PHÍA TRÊN
    // ---------------------------------------------------------
    var labelTopMM = docHeightMM - margin;
    var labelBottomMM = labelTopMM - labelH;
    var labelLeftMM = margin;
    var labelWMM = totalWidth + 70;

    rectMM(labelLayer, labelLeftMM, labelTopMM, labelWMM, labelH, WHITE, BLACK, 0.6);

    // Tỉ lệ 5 cột theo đúng khung tem tiêu chuẩn
    var c1 = labelWMM * 0.168; // Logo
    var c2 = labelWMM * 0.227; // Thông tin mã hàng
    var c3 = labelWMM * 0.202; // Bảng màu
    var c4 = labelWMM * 0.235; // SÓNG (rộng hơn chút để chia 2 cột nhỏ)
    var c5 = labelWMM - c1 - c2 - c3 - c4; // QUY TRÌNH SẢN XUẤT

    var x0 = labelLeftMM;
    var x1 = x0 + c1;
    var x2 = x1 + c2;
    var x3 = x2 + c3;
    var x4 = x3 + c4;
    var x5 = labelLeftMM + labelWMM;

    lineMM(labelLayer, x1, labelTopMM, x1, labelBottomMM);
    lineMM(labelLayer, x2, labelTopMM, x2, labelBottomMM);
    lineMM(labelLayer, x3, labelTopMM, x3, labelBottomMM);
    lineMM(labelLayer, x4, labelTopMM, x4, labelBottomMM);

    // --- CỘT 1: LOGO NEWPACK ---
    var logo = val("Logo");
    var logoChars = logo.split("");
    var logoGap = 3;
    var logoBoxW = Math.min(labelWMM / 50.228, (c1 - (labelWMM / 50.228) - logoGap * (logoChars.length - 1)) / Math.max(logoChars.length, 1));
    var logoTotalW = logoChars.length * logoBoxW + Math.max(0, logoChars.length - 1) * logoGap;
    var lx = x0 + (c1 - logoTotalW) / 2;
    var ly = labelTopMM - labelH * 0.35;
    for (var li = 0; li < logoChars.length; li++) {
        rectMM(labelLayer, lx + li * (logoBoxW + logoGap), ly, logoBoxW, labelH / 5.869, BLUE, BLUE, 0.2);
        centeredTextMM(labelLayer, logoChars[li], lx + li * (logoBoxW + logoGap), ly, logoBoxW, labelH / 3.2, labelH / 2.5, true, WHITE);
    }

    // --- CỘT 2: THÔNG TIN CHI TIẾT ---
    var rowH = labelH / 5;
    for (var r = 1; r < 5; r++) {
        lineMM(labelLayer, x1, labelTopMM - rowH * r, x2, labelTopMM - rowH * r);
    }
    
    textMM(labelLayer, "MÃ KHÁCH HÀNG: " + val("Mã khách hàng"), x1 + 2.5 * scale, labelTopMM - rowH * 0.5 - (3.5 * scale / 2), totalWidth / 29.42, true);
    textMM(labelLayer, "MÃ HÀNG: " + val("Mã hàng"), x1 + 2.5 * scale, labelTopMM - rowH * 1.5 - (3.5 * scale / 2), totalWidth / 29.42, true);
    textMM(labelLayer, "PHIÊN BẢN: " + val("Phiên bản"), x1 + c2 * 0.60, labelTopMM - rowH * 1.5 - (3.5 * scale / 2), totalWidth / 29.42, true);
    textMM(labelLayer, "TÊN SP: " + val("Tên sản phẩm"), x1 + 2.5 * scale, labelTopMM - rowH * 2.5 - (3.5 * scale / 2), totalWidth / 29.42, true);
    textMM(labelLayer, "KT PHỦ BÌ: " + val("Kích thước phủ bì"), x1 + 2.5 * scale, labelTopMM - rowH * 3.5 - (3.5 * scale / 2), totalWidth / 29.42, true);
    textMM(labelLayer, "KHỔ: " + val("Khổ (mm)") + " (MM)", x1 + 2.5 * scale, labelTopMM - rowH * 4.5 - (3.5 * scale / 2), totalWidth / 29.42, true);
    textMM(labelLayer, "DÀI: " + val("Dài bản trải (mm)") + "(MM)", x1 + c2 * 0.52, labelTopMM - rowH * 4.5 - (3.5 * scale / 2), totalWidth / 29.42, true);

    // --- CỘT 3: BẢNG MÀU + LOẠI CARTON ---
    var colorRows = [
        ["Màu ①", "Đen", BLACK],
        ["Màu ②", "Đỏ", RED],
        ["Màu ③", "Xanh", DARKBLUE],
        ["Màu ④", "Xám", GREY]
    ];
    var colorAreaH = labelH * 0.64;
    var colorRowH = colorAreaH / 4;
    for (var cr = 1; cr < 4; cr++) {
        lineMM(labelLayer, x2, labelTopMM - colorRowH * cr, x3, labelTopMM - colorRowH * cr);
    }
    lineMM(labelLayer, x2, labelTopMM - colorAreaH, x3, labelTopMM - colorAreaH);

    for (var ci = 0; ci < 4; ci++) {
        var cy = labelTopMM - colorRowH * ci;
        textMM(labelLayer, colorRows[ci][0], x2 + 1.5 * scale, cy - colorRowH * 0.5 + 1.5 * scale, labelH / 4.1, false);
        textMM(labelLayer, colorRows[ci][1], x2 + c3 * 0.38, cy - colorRowH * 0.5 + 1.5 * scale, labelH / 4.1, true);
        rectMM(labelLayer, x2 + c3 * 0.62, cy - 1.1 * scale, c3 * 0.34, colorRowH - 1.8 * scale, colorRows[ci][2], BLACK, 0.35);
    }

    rectMM(labelLayer, x2, labelBottomMM + (labelH - colorAreaH), c3, labelH - colorAreaH, WHITE, BLACK, 0.35);
    centeredTextMM(labelLayer, val("Loại carton"), x2 + 1, labelBottomMM + (labelH - colorAreaH), c3 - 2, labelH - colorAreaH, labelH / 2.5, false, BLACK);

    // =========================================================
    // --- CỘT 4: SÓNG (ĐÃ SỬA CHIA 2 CỘT CON CHUẨN ẢNH 2) ---
    // =========================================================
    var headerH = rowH; 
    centeredTextMM(labelLayer, "SÓNG", x3, labelTopMM - headerH * 0.5 - (3.5 * scale / 2), c4, headerH, labelH / 3.8, true, BLACK);
    lineMM(labelLayer, x3, labelTopMM - headerH, x4, labelTopMM - headerH);

    // Đường vách ngăn giữa 2 cột trong vùng SÓNG
    var c4_subW = c4 * 0.48; // Cột bên trái
    lineMM(labelLayer, x3 + c4_subW, labelTopMM - headerH, x3 + c4_subW, labelBottomMM);

    var contentTopY4 = labelTopMM - headerH;
    var contentBottomY4 = labelBottomMM;
    var availH4 = contentTopY4 - contentBottomY4;

    // Cỡ ô vuông checkbox & chữ lớn đậm hơn
    var cbSize = Math.min(availH4 / 4.2, 5.8 * scale);
    var fontWaveSize = labelH / 3.6;

    // Cột trái Sóng: 3 mục
    var waveLeftItems = [
        { label: "LẦN ĐÔI", val: waveDouble.value },
        { label: "LẦN PHẲNG", val: waveFlat.value },
        { label: "KHÔNG LẦN", val: waveNone.value }
    ];

    var slotH_Left = availH4 / 3;
    for (var wL = 0; wL < 3; wL++) {
        var slotTop = contentTopY4 - wL * slotH_Left;
        var cbTop = slotTop - (slotH_Left - cbSize) / 2;
        checkboxMM(labelLayer, x3 + 2.5 * scale, cbTop, cbSize, waveLeftItems[wL].label, waveLeftItems[wL].val, fontWaveSize);
    }

    // Cột phải Sóng: 4 mục
    var waveRightItems = [
        { label: "HỘP LIỀN", val: procGlue.value },
        { label: "HỘP GHÉP", val: procJoin.value },
        { label: "VÁCH", val: procVach.value },
        { label: "LÓT", val: procLot.value }
    ];

    var slotH_Right = availH4 / 4;
    for (var wR = 0; wR < 4; wR++) {
        var slotTopR = contentTopY4 - wR * slotH_Right;
        var cbTopR = slotTopR - (slotH_Right - cbSize) / 2;
        checkboxMM(labelLayer, x3 + c4_subW + 2.5 * scale, cbTopR, cbSize, waveRightItems[wR].label, waveRightItems[wR].val, fontWaveSize);
    }


    // =========================================================
    // --- CỘT 5: QUY TRÌNH SẢN XUẤT (ĐÃ SỬA ĐÚNG 4 MỤC CHUẨN ẢNH 2) ---
    // =========================================================
    centeredTextMM(labelLayer, "QUY TRÌNH SẢN XUẤT", x4, labelTopMM - headerH * 0.5 - (3.5 * scale / 2), c5, headerH, labelH / 3.8, true, BLACK);
    lineMM(labelLayer, x4, labelTopMM - headerH, x5, labelTopMM - headerH);

    var footerH = labelH/6;
    var footerY = labelBottomMM + footerH;

    var contentTopY5 = labelTopMM - headerH;
    var contentBottomY5 = footerY;
    var availH5 = contentTopY5 - contentBottomY5;

    var pColW = c5 / 2;
    var pLeftCol = x4 + 3.5 * scale;
    var pRightCol = x4 + pColW + 3.5 * scale;

    // Cột 5 chỉ gồm 4 mục chính (2 hàng x 2 cột)
    var procLeftItems = [
        { label: "BỔ CHẠP", val: procFlap.value },
        { label: "BẾ", val: procBe.value }
    ];

    var procRightItems = [
        { label: "HỘP DÁN", val: procGlue2.value },
        { label: "HỘP GHIM", val: procStaple.value }
    ];

    var slotH5 = availH5 / 2;
    for (var pi = 0; pi < 2; pi++) {
        var slotTop5 = contentTopY5 - pi * slotH5;
        var cbTop5 = slotTop5 - (slotH5 - cbSize) / 2;
        
        checkboxMM(labelLayer, pLeftCol, cbTop5, cbSize, procLeftItems[pi].label, procLeftItems[pi].val, fontWaveSize);
        checkboxMM(labelLayer, pRightCol, cbTop5, cbSize, procRightItems[pi].label, procRightItems[pi].val, fontWaveSize);
    }

    // Chân cột Quy trình (Thiết kế / Tên / Ngày)
    lineMM(labelLayer, x4, footerY, x5, footerY);
    lineMM(labelLayer, x4 + c5 * 0.32, labelBottomMM, x4 + c5 * 0.32, footerY);
    lineMM(labelLayer, x4 + c5 * 0.75, labelBottomMM, x4 + c5 * 0.75, footerY);
    
    var footerCenterY = labelBottomMM + footerH / 2;
    var footerTextSize = Math.min(footerH * 0.38, labelH / 4.2);

    centeredTextMM(labelLayer, "Thiết kế", x4, footerCenterY + footerTextSize * 0.35, c5 * 0.32, footerH, labelH / 3.8, true);
    centeredTextMM(labelLayer, val("Người thiết kế"), x4 + c5 * 0.32, footerCenterY + footerTextSize * 0.35, c5 * 0.43, footerH, labelH / 3.8, true);
    centeredTextMM(labelLayer, val("Ngày"), x4 + c5 * 0.75, footerCenterY + footerTextSize * 0.35, c5 * 0.25, footerH, labelH / 3.8, true);

    // ---------------------------------------------------------
    // 6. VẼ KHUNG HỘP CARTON BÊN DƯỚI
    // ---------------------------------------------------------
    var boxTopMM = labelBottomMM - gapLabelBox;

    var xStartMM = margin + G;
    var xA = xStartMM;
    var xB = xA + L;
    var xC = xB + W;
    var xD = xC + L;

    var y0 = boxTopMM;
    var y1 = y0 - F;
    var y2 = y1 - H;
    var y3 = y2 - F;

    var panelX = [xA, xB, xC, xD];
    var panelWidths = [L, W, L, W];

    // Tai dán bên trái
    rectMM(boxLayer, xA - G, y1, G, H, WHITE, LIGHTGREY, 0.25);

    // 4 mặt thân hộp
    for (var i = 0; i < 4; i++) {
        rectMM(boxLayer, panelX[i], y1, panelWidths[i], H, WHITE, LIGHTGREY, 0.25);
    }

    // 4 nắp trên
    for (var j = 0; j < 4; j++) {
        rectMM(boxLayer, panelX[j], y0, panelWidths[j], F, WHITE, LIGHTGREY, 0.25);
    }

    // 4 nắp dưới
    for (var k = 0; k < 4; k++) {
        rectMM(boxLayer, panelX[k], y2, panelWidths[k], F, WHITE, LIGHTGREY, 0.25);
    }

    // ---------------------------------------------------------
    // 7. THÔNG BÁO HOÀN TẤT
    // ---------------------------------------------------------
    alert(
        "ĐÃ CẬP NHẬT CHUẨN THEO ẢNH MẪU 2!\n\n" +
        "- Đã chia vùng SÓNG thành 2 cột nhỏ đúng thiết kế.\n" +
        "- Trả các mục (HỘP LIỀN, HỘP GHÉP, VÁCH, LÓT) về cột SÓNG.\n" +
        "- Cột QUY TRÌNH SẢN XUẤT thu gọn lại đúng 4 mục (BỔ CHẠP, BẾ, HỘP DÁN, HỘP GHIM).\n" +
        "- Tăng kích thước ô Checkbox và font chữ để vừa vặn, chuẩn nét như mẫu."
    );

})();