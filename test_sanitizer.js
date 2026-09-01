process.env.R2_PUBLIC_URL = 'https://pub-mybucket.r2.dev';

import('./src/utils/sanitizer.js').then(({ sanitizeArticleContent }) => {
  const testCases = [
    '<img src="https://evil.com/image.jpg">',
    '<img src="https://evil.com/pub-malicious-image.jpg">',
    '<img src="javascript:alert(1)">',
    '<img src="data:text/html,<script>alert(1)</script>">',
    '<img src="/api/v1/images/news/body-example.png">',
    '<img src="https://pub-mybucket.r2.dev/news/body-example.png">',
    '<script>alert("XSS")</script>',
    '<img src="/api/v1/images/news/body-example.png" onerror="alert(1)">'
  ];

  testCases.forEach((tc, i) => {
    console.log(`\nTest ${i + 1}: ${tc}`);
    const result = sanitizeArticleContent(tc);
    console.log(`Result: ${result}`);
  });
});
