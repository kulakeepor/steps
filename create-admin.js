// 创建管理员账号
const SUPABASE_URL = 'https://kwzgjxwejjvzmtnrxeph.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3emdqeHdlamp2em10bnJ4ZXBoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU5NzY5OSwiZXhwIjoyMDg4MTczNjk5fQ.jwYcMZ_AFmV6_CvYcqB_YG9GOxH88HW99ClDWbfWAUA';

const bcrypt = require('bcryptjs');

async function createAdmin() {
  // 生成密码哈希
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const adminId = 'admin-' + Date.now();
  
  // 插入管理员
  const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      id: adminId,
      email: 'admin@steps.com',
      name: '管理员',
      password: hashedPassword,
      role: 'ADMIN',
      steps: 1000
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('✓ 管理员账号创建成功！');
    console.log('');
    console.log('登录信息：');
    console.log('  邮箱: admin@steps.com');
    console.log('  密码: admin123');
    console.log('');
    console.log('访问地址: https://steps-app-three.vercel.app');
  } else {
    const text = await response.text();
    console.log('创建失败:', text);
  }
}

createAdmin().catch(console.error);
