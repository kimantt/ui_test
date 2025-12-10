export const inputValidator = (inputText) => {
  const trimmed = inputText.trim();

  // 1) 공백 제한
  if (!trimmed) return false;

  // 2) 위험한 HTML / 스크립트 패턴 차단
  const forbiddenRegex = /[<>;"'`$(){}[\]\\\/]|(script)|(--)/gi;
  if (forbiddenRegex.test(trimmed)) return false;

  // 3) HTML 엔티티 기반 XSS 차단
  //    &lt; &gt; &amp; &quot; &apos; &#60; &#x3C; 등
  const htmlEntityRegex = /&(lt|gt|amp|quot|apos|nbsp|#\d+|#x[0-9A-Fa-f]+);/g;
  if (htmlEntityRegex.test(trimmed)) return false;

  // 4) Zero-width 및 제어 문자 차단
  const controlCharRegex = /[\u0000-\u001F\u007F\u200B-\u200D\uFEFF]/g;
  if (controlCharRegex.test(trimmed)) return false;

  return true;
};
