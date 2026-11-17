let bgImg; // 儲存背景圖片。
let idleSheet; // 儲存角色1的八格站立圖片精靈圖。
let walkSheet; // 儲存角色1的四格走路圖片精靈圖。
let attackSheet; // 儲存角色1的五格攻擊圖片精靈圖。
let raiseSheet; // 儲存角色1的五格舉手圖片精靈圖。
let sitSheet; // 儲存角色1的八格坐下圖片精靈圖。

let animationState = "idle"; // 記錄角色目前播放的動畫狀態。
let facingRight = true; // 記錄角色目前面向的方向。
let characterX = 0; // 記錄角色在畫布上的水平位置。
let bgX = 0; // 記錄中央背景圖片的水平中心位置。
let currentFrame = 0; // 記錄目前要顯示的動畫格。

const frameDuration = 120; // 設定每格動畫顯示的毫秒數。
const moveSpeed = 280; // 設定每秒移動的畫布像素數。
let lastFrameTime = 0; // 記錄上次切換動畫格的時間。

function preload() { // 在畫布建立前先載入圖片。
  bgImg = loadImage("bg/0.png"); // 載入背景圖片。
  idleSheet = loadImage("1/stop/stop.png"); // 載入角色1的八格站立精靈圖。
  walkSheet = loadImage("1/walk/walk.png"); // 載入角色1的四格走路精靈圖。
  attackSheet = loadImage("1/attack/attack.png"); // 載入角色1的五格攻擊精靈圖。
  raiseSheet = loadImage("1/舉手/舉手.png"); // 載入角色1的五格舉手精靈圖。
  sitSheet = loadImage("1/sit/sit.png"); // 載入角色1的八格坐下精靈圖。
} // 結束圖片載入函式。

function setup() { // 設定畫布與繪圖模式。
  createCanvas(windowWidth, windowHeight); // 建立符合目前視窗大小的全螢幕畫布。
  imageMode(CENTER); // 讓圖片的位置以中心點為基準。
  frameRate(60); // 設定畫面更新頻率為每秒60格。
  characterX = width / 2; // 將角色初始位置設在畫布正中間。
  bgX = width / 2; // 背景初始對齊畫面中心。
} // 結束畫布設定函式。

function draw() { // 每個畫面週期更新背景、角色位置與動畫。
  clear(); // 清除前一幀畫面，不填底色，讓畫面只顯示背景圖片。

  // 1. 計算背景與角色的尺寸（確保三張串接背景一定能完整覆蓋整個畫布）
  const bgDrawHeight = height;
  const bgDrawWidth = max(bgDrawHeight * (bgImg.width / bgImg.height), width);

  const animationFrameCount = animationState === "walk" ? 4 : animationState === "attack" || animationState === "raise" ? 5 : 8;
  const activeSheet = animationState === "walk" ? walkSheet : animationState === "attack" ? attackSheet : animationState === "raise" ? raiseSheet : animationState === "sit" ? sitSheet : idleSheet;
  const frameWidth = activeSheet.width / animationFrameCount;
  const displayHeight = height / 3; // 角色高度為畫布高度的 1/3
  const displayWidth = displayHeight * (frameWidth / activeSheet.height); // 等比例計算角色寬度

  // 三張串接背景（左、中、右）的總寬度為 3 * bgDrawWidth
  // 確保左右最外緣剛好切齊畫布左右邊界，絕不露出空白
  const minBgX = width - 1.5 * bgDrawWidth; // 背景往左捲到最右邊盡頭的極限
  const maxBgX = 1.5 * bgDrawWidth;         // 背景往右捲到最左邊盡頭的極限
  const step = moveSpeed * deltaTime / 1000; // 本幀移動的距離（恆為正數）

  // 2. 處理按鍵移動與背景/角色捲動邏輯
  if (keyIsDown(RIGHT_ARROW) && !keyIsDown(LEFT_ARROW)) {
    // 按下右鍵：角色面向右，背景往左移動
    if (characterX < width / 2) {
      // 若角色原本在畫面左側，先走回畫面中間
      characterX = min(width / 2, characterX + step);
    } else if (bgX > minBgX) {
      // 背景還沒到最右邊，背景往左移動
      bgX = max(minBgX, bgX - step);
    } else {
      // 背景已到最右邊暫停捲動，角色往右移動
      characterX = min(width - displayWidth / 2, characterX + step);
    }
  } else if (keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW)) {
    // 按下左鍵：角色面向左，背景往右移動
    if (characterX > width / 2) {
      // 若角色原本在畫面右側，先走回畫面中間
      characterX = max(width / 2, characterX - step);
    } else if (bgX < maxBgX) {
      // 背景還沒到最左邊，背景往右移動
      bgX = min(maxBgX, bgX + step);
    } else {
      // 背景已到最左邊暫停捲動，角色往左移動
      characterX = max(displayWidth / 2, characterX - step);
    }
  }

  // 3. 繪製三張串接的背景圖片（左、中、右無縫拼接）
  image(bgImg, bgX - bgDrawWidth, height / 2, bgDrawWidth, bgDrawHeight); // 左側複製背景
  image(bgImg, bgX, height / 2, bgDrawWidth, bgDrawHeight);               // 中央背景
  image(bgImg, bgX + bgDrawWidth, height / 2, bgDrawWidth, bgDrawHeight); // 右側複製背景

  // 4. 動畫格切換時間控制
  if (millis() - lastFrameTime >= frameDuration) {
    if (animationState === "attack" || animationState === "raise" || animationState === "sit") {
      currentFrame += 1;
      if (currentFrame >= animationFrameCount) {
        animationState = keyIsDown(RIGHT_ARROW) || keyIsDown(LEFT_ARROW) ? "walk" : "idle";
        if (animationState === "walk") {
          facingRight = keyIsDown(RIGHT_ARROW);
        }
        currentFrame = 0;
      }
    } else {
      currentFrame = (currentFrame + 1) % animationFrameCount;
    }
    lastFrameTime = millis();
  }

  // 5. 繪製角色
  const sourceX = currentFrame * frameWidth;
  push();
  translate(characterX, height - displayHeight / 2);
  scale(facingRight ? 1 : -1, 1);
  image(activeSheet, 0, 0, displayWidth, displayHeight, sourceX, 0, frameWidth, activeSheet.height);
  pop();
}

function keyPressed(event) {
  if (event && event.repeat) { return false; }
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
    facingRight = keyCode === RIGHT_ARROW;
    if (animationState !== "attack" && animationState !== "raise" && animationState !== "sit" && animationState !== "walk") {
      animationState = "walk";
      currentFrame = 0;
      lastFrameTime = millis();
    }
    return false;
  }
  if (key === " " || keyCode === 32) {
    animationState = "attack";
    currentFrame = 0;
    lastFrameTime = millis();
    return false;
  }
  if (keyCode === UP_ARROW) {
    animationState = "raise";
    currentFrame = 0;
    lastFrameTime = millis();
    return false;
  }
  if (keyCode === DOWN_ARROW) {
    animationState = "sit";
    currentFrame = 0;
    lastFrameTime = millis();
    return false;
  }
}

function keyReleased() {
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
    const stillMoving = keyIsDown(RIGHT_ARROW) || keyIsDown(LEFT_ARROW);
    if (animationState === "walk" && !stillMoving) {
      animationState = "idle";
      currentFrame = 0;
      lastFrameTime = millis();
    } else if (animationState === "walk" && stillMoving) {
      facingRight = keyIsDown(RIGHT_ARROW);
    }
    return false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}