class SlotMachine {
  constructor() {
    this.parts = ['eyes', 'nose', 'mouth'];
    this.currentPart = 0;
    this.selections = {};
    this.intervals = {};
    this.init();
  }

  init() {
    this.parts.forEach(part => {
      const btn = document.querySelector(`[data-part="${part}"]`);
      btn.addEventListener('click', () => this.toggleSlot(part));
    });
  }

  // 
  toggleSlot(part) {
    const btn = document.querySelector(`[data-part="${part}"]`);
    
    if (btn.textContent === 'Démarrer') {
        this.startSlot(part);
        btn.textContent = 'Pause';
    } else {
        clearInterval(this.intervals[part]);
        
        // 멈춘 시점의 화살표 위치
        const arrow = document.querySelector(`#${part}-row .arrow`);
        const arrowRect = arrow.getBoundingClientRect();
        const arrowX = arrowRect.left;
        
        // 해당 파트의 이미지들 가져오기
        const images = document.querySelectorAll(`#${part}-row img`);
        let minDistance = Infinity;
        let selectedIndex = 0;
        
        // 각 이미지와 화살표 사이의 거리를 계산하여 가 ���
        images.forEach((img, index) => {
            const imgRect = img.getBoundingClientRect();
            const imgCenterX = imgRect.left + (imgRect.width / 2);
            const distance = Math.abs(arrowX - imgCenterX);
            
            if (distance < minDistance) {
                minDistance = distance;
                selectedIndex = index;
            }
        });
        
        // 화살표가 하얀 배경 위에 있는지 확인
        const selectedImg = images[selectedIndex];
        const imgRect = selectedImg.getBoundingClientRect();
        
        // 화살표가 이미지 영역을 벗어났다면 가장 가까운 이미지 위치로 이동
        if (arrowX < imgRect.left || arrowX > imgRect.right) {
            const newPosition = imgRect.left + (imgRect.width / 2);
            arrow.style.left = `${newPosition}px`;
        }
        
        // 선택된 이미지 저장
        this.selections[part] = selectedImg.src;
        
        btn.textContent = 'Fin';
        btn.disabled = true;
        
        // 모든 버튼이 '완료' 상태인지 확인
        const allComplete = this.parts.every(p => {
            const button = document.querySelector(`[data-part="${p}"]`);
            return button.textContent === 'Fin';
        });
        
        if (allComplete) {
            setTimeout(() => this.showResult(), 1000);
        }
    }
}
  startSlot(part) {
    const arrow = document.querySelector(`#${part}-row .arrow`);
    const imageWidth = 150;
    const gap = -3;
    let fullWidth, startPosition, moveSpeed;

    if (part === 'eyes') {
        startPosition = -160;
        fullWidth = (imageWidth + gap) * 6;
        moveSpeed = 88;
    } else if (part === 'mouth') {
        startPosition = -200;
        fullWidth = (imageWidth + gap) * 6;
        moveSpeed = 88;
    } else {  // nose
        startPosition = 60;  // 코1 이미지의 왼쪽 끝으로 초기 위치 설정
        fullWidth = (imageWidth + gap) * 4.5;
        moveSpeed = 65;
    }
    
    arrow.style.left = `${startPosition}px`;
    
    let position = startPosition;
    let direction = 1;
    
    this.intervals[part] = setInterval(() => {
      position += moveSpeed * direction;
      
      if (position >= fullWidth) {
        position = fullWidth;
        direction = -1;
      } else if (position <= startPosition) {
        position = startPosition;
        direction = 1;
      }
      
      arrow.style.left = `${position}px`;
    }, 30);
  }

  stopSlot(part) {
    clearInterval(this.intervals[part]);
    const arrow = document.querySelector(`#${part}-row .arrow`);
    const arrowRect = arrow.getBoundingClientRect();  // 화살 위치 정보
    const arrowY = arrowRect.top + arrowRect.height / 2;  // 화살표 중심의 y좌표
    
    // 해당 파트의 모든 이미지 가져오기
    const images = document.querySelectorAll(`#${part}-row img`);
    let minDistance = Infinity;
    let selectedIndex = 0;
    
    // y축 기준으로 가장 가까운 이미지 찾기
    images.forEach((img, index) => {
        const imgRect = img.getBoundingClientRect();
        const imgY = imgRect.top + imgRect.height / 2;  // 이미지 심의 y좌표
        const distance = Math.abs(arrowY - imgY);
        
        if (distance < minDistance) {
            minDistance = distance;
            selectedIndex = index;
        }
    });
    
    // 선택된 이미지 저장
    this.selections[part] = images[selectedIndex].src;
    
    console.log(`${part} 선택된 이미지 덱스:`, selectedIndex);
  }

  checkGameComplete() {
    if (Object.keys(this.selections).length === 3) {
      setTimeout(() => this.showResult(), 1000);
    }
  }

  showResult() {
    document.getElementById('slot-machine').style.display = 'none';
    const resultSection = document.getElementById('result');
    resultSection.style.display = 'block';
    
    const combinedFace = document.querySelector('.combined-face');
    combinedFace.style.overflow = 'visible';
    combinedFace.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <img src="${this.selections.eyes}" alt="눈" style="flex: 1; margin: 0; padding: 0; transform: translate(-120px, -10pt) scale(1.3);">
        <img src="${this.selections.nose}" alt="코" style="flex: 1; margin: 0; padding: 0; transform: translate(-120px, -20pt) scale(1.3);">
        <img src="${this.selections.mouth}" alt="" style="flex: 1; margin: 0; padding: 0; transform: translate(-120px, -5pt) scale(1.05);">
      </div>
    `;

    // 모든 요소를 초기에 숨김
    const leftBubble = document.querySelector('.left-bubble');
    const rightBubble = document.querySelector('.right-bubble');
    const character = document.getElementById('character');
    const restartBtn = document.getElementById('restart-btn');
    
    leftBubble.style.opacity = '0';
    rightBubble.style.opacity = '0';
    character.style.opacity = '0';
    restartBtn.style.display = 'none';
    restartBtn.style.opacity = '0';

    // 첫 번째: 안녕 말풍선
    setTimeout(() => {
        leftBubble.style.opacity = '1';
    }, 1000);

    // 두 번째: 캐릭터
    setTimeout(() => {
        character.style.opacity = '1';
    }, 2000);

    // 세 번째: 넌덤 메시지 말풍선
    setTimeout(() => {
        rightBubble.style.opacity = '1';
        
        // 랜덤 메시지 배열 추가
        const messages = [
            'Qu\'ai-je fait de mal ?',
            'Pourquoi tu fais ça,eun ?',
            'Qu\'est-ce qui ne va pas avec ton visage ?',
            'Y a un problème ?',
            'T\'es bizarre toi,ein ?'
        ];
        
        // 랜덤하게 하나의 메시지 선택
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        rightBubble.textContent = randomMessage;  // 랜덤 메시지로 변경
        
        // 네 번째: 다시하기 버튼 (말풍선이 나타난 후 1초 뒤)
        setTimeout(() => {
            restartBtn.style.display = 'flex';
            restartBtn.style.opacity = '1';
        }, 1000);
    }, 3000);
  }
}

// 게임 시작
window.addEventListener('DOMContentLoaded', () => {
  new SlotMachine();
}); 
