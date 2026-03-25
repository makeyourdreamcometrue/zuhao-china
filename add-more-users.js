const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hedvkncylfkudabbtpzt.supabase.co';
const supabaseKey = 'sb_publishable_0kftv5iPegZ886vU3UFD6Q_5vyxpJpe';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addMore() {
  console.log('Adding more users...');
  
  // Additional landlords
  const moreLandlords = [
    { name: '孙丽', phone: '13899988801', wechat_id: 'SunLi_9901', email: 'sunli.13899988801@163.com' },
    { name: '周建', phone: '13988877702', wechat_id: 'ZhouJian_9922', email: 'zhoujian.13988877702@qq.com' },
    { name: '吴霞', phone: '13677766603', wechat_id: 'WuXia_9933', email: 'wuxia.13677766603@126.com' },
  ];

  // Additional tenants
  const moreTenants = [
    { name: '林一', phone: '15811112201', email: 'linyi.15811112201@163.com' },
    { name: '关二', phone: '15922223302', email: 'guaner.15922223302@qq.com' },
    { name: '孔三', phone: '15033334403', email: 'kongsan.15033334403@126.com' },
    { name: '曹四', phone: '15144445504', email: 'caosi.15144445504@163.com' },
    { name: '严五', phone: '15255556605', email: 'yanwu.15255556605@sina.com' },
    { name: '魏六', phone: '15366667706', email: 'weiliu.15366667706@qq.com' },
    { name: '姜七', phone: '15477778807', email: 'jiangqi.15477778807@126.com' },
    { name: '许八', phone: '15588889908', email: 'xuba.15588889908@163.com' },
    { name: '何九', phone: '15699990009', email: 'hejiu.15699990009@sina.com' },
    { name: '吕十', phone: '15700001110', email: 'lvshi.15700001110@qq.com' },
    { name: '施一', phone: '18811112211', email: 'shiyi.18811112211@126.com' },
    { name: '张二', phone: '18922223312', email: 'zhanger.18922223312@163.com' },
  ];
  
  for (const l of moreLandlords) {
    try { await supabase.from('users').insert({ ...l, role: 'landlord' }); console.log('Added landlord:', l.name); } catch(e) {}
  }
  
  for (const t of moreTenants) {
    try { await supabase.from('users').insert({ ...t, role: 'tenant' }); console.log('Added tenant:', t.name); } catch(e) {}
  }
  
  const { data: users } = await supabase.from('users').select('role');
  const landlords = users?.filter(u => u.role === 'landlord').length || 0;
  const tenants = users?.filter(u => u.role === 'tenant').length || 0;
  
  console.log('\n=== Final Stats ===');
  console.log('Landlords:', landlords);
  console.log('Tenants:', tenants);
}

addMore();
