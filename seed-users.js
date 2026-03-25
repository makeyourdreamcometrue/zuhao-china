const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hedvkncylfkudabbtpzt.supabase.co';
const supabaseKey = 'sb_publishable_0kftv5iPegZ886vU3UFD6Q_5vyxpJpe';
const supabase = createClient(supabaseUrl, supabaseKey);

// 10 Fake Landlords
const landlords = [
  { name: '张伟', phone: '13812345601', wechat_id: 'ZhangWei_8881', email: 'zhangwei.13812345601@163.com', property_count: 3 },
  { name: '李娜', phone: '13923456702', wechat_id: 'LiNa_8822', email: 'lina.13923456702@sina.com', property_count: 2 },
  { name: '王强', phone: '13634567803', wechat_id: 'WangQiang_8833', email: 'wangqiang.13634567803@qq.com', property_count: 5 },
  { name: '刘芳', phone: '13745678904', wechat_id: 'LiuFang_8844', email: 'liufang.13745678904@126.com', property_count: 2 },
  { name: '陈明', phone: '13556789005', wechat_id: 'ChenMing_8855', email: 'chenming.13556789005@163.com', property_count: 4 },
  { name: '杨静', phone: '13467890106', wechat_id: 'YangJing_8866', email: 'yangjing.13467890106@sina.com', property_count: 1 },
  { name: '赵磊', phone: '13378901207', wechat_id: 'ZhaoLei_8877', email: 'zhaolei.13378901207@qq.com', property_count: 3 },
  { name: '黄敏', phone: '13289012308', wechat_id: 'HuangMin_8888', email: 'huangmin.13289012308@126.com', property_count: 2 },
  { name: '周涛', phone: '13190123409', wechat_id: 'ZhouTao_8899', email: 'zhoutao.13190123409@163.com', property_count: 4 },
  { name: '吴婷', phone: '13001234510', wechat_id: 'WuTing_8800', email: 'wuting.13001234510@sina.com', property_count: 1 },
];

// 20 Fake Tenants with landlord links
const tenants = [
  { name: '张三', phone: '18812345601', email: 'zhangsan.18812345601@163.com', landlord_idx: 0 },
  { name: '李四', phone: '18923456702', email: 'lisi.18923456702@qq.com', landlord_idx: 0 },
  { name: '王五', phone: '18734567803', email: 'wangwu.18734567803@126.com', landlord_idx: 0 },
  { name: '赵六', phone: '18645678904', email: 'zhaoliu.18645678904@163.com', landlord_idx: 1 },
  { name: '孙七', phone: '18556789005', email: 'sunqi.18556789005@sina.com', landlord_idx: 1 },
  { name: '周八', phone: '18467890106', email: 'zhouba.18467890106@qq.com', landlord_idx: 2 },
  { name: '吴九', phone: '18378901207', email: 'wujiu.18378901207@126.com', landlord_idx: 2 },
  { name: '郑十', phone: '18289012308', email: 'zhengshi.18289012308@163.com', landlord_idx: 2 },
  { name: '冯一', phone: '18190123409', email: 'fengyi.18190123409@sina.com', landlord_idx: 3 },
  { name: '褚二', phone: '18001234510', email: 'chuer.18001234510@qq.com', landlord_idx: 3 },
  { name: '卫三', phone: '17812345611', email: 'weisan.17812345611@126.com', landlord_idx: 4 },
  { name: '蒋四', phone: '17723456712', email: 'jiangsi.17723456712@163.com', landlord_idx: 4 },
  { name: '沈五', phone: '17634567813', email: 'shenwu.17634567813@sina.com', landlord_idx: 4 },
  { name: '韩六', phone: '17545678914', email: 'hanliu.17545678914@qq.com', landlord_idx: 4 },
  { name: '杨七', phone: '17456789015', email: 'yangqi.17456789015@126.com', landlord_idx: 5 },
  { name: '朱八', phone: '17367890116', email: 'zhuba.17367890116@163.com', landlord_idx: 6 },
  { name: '秦九', phone: '17278901217', email: 'qinjiu.17278901217@sina.com', landlord_idx: 6 },
  { name: '许十', phone: '17189012318', email: 'xushi.17189012318@qq.com', landlord_idx: 7 },
  { name: '何一', phone: '17090123419', email: 'heyi.17090123419@126.com', landlord_idx: 8 },
  { name: '吕二', phone: '16901234520', email: 'lver.16901234520@163.com', landlord_idx: 9 },
];

// Email Templates
const emailTemplates = {
  rent_due_reminder: `【租好】尊敬的租客您好，您的租金将于{date}到期，本月租金金额为{amount}元。请按时缴纳，以免影响您的信用记录。如已缴纳，请忽略此消息。感谢您的配合！`,
  
  rent_payment_success: `【租好】租金支付成功！您已成功支付{date}租金{amount}元。支付方式：{method}。如有疑问，请联系您的房东或客服400-888-8888。感谢使用租好平台！`,
  
  repair_completion: `【租好】维修服务已完成！您提交的维修工单"{title}"已于{date}完成维修。如有任何问题，请联系您的房东或随时联系我们。感谢您的理解与支持！`,
  
  landlord_income_summary: `【租好】房东您好！您本月的租金收入汇总如下：\n- 本月应收租金：{total}元\n- 已收租金：{received}元\n- 待收租金：{pending}元\n- 房源数量：{property_count}套\n详情请登录租好平台查看。如有疑问，请联系客服。`,
  
  password_reset: `【租好】您正在重置密码，验证码为：{code}，有效期30分钟。如非本人操作，请忽略此消息。为保护账户安全，请勿向他人透露验证码。`,
  
  maintenance_notice: `【租好】维修通知：您位于{address}的房源将于{date}进行例行维护，维护内容：{content}。届时可能需要您配合开门，对此造成不便敬请谅解。如有问题，请联系房东或平台客服。`,
};

async function seedData() {
  console.log('开始生成模拟数据...\n');

  // Create landlords
  const landlordIds = [];
  for (const landlord of landlords) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        phone: landlord.phone,
        name: landlord.name,
        role: 'landlord',
        wechat_id: landlord.wechat_id,
        email: landlord.email
      })
      .select('id')
      .single();
    
    if (error) {
      // Try to get existing user
      const { data: existing } = await supabase.from('users').select('id').eq('phone', landlord.phone).single();
      landlordIds.push(existing?.id);
      console.log(`房东 ${landlord.name} 已存在`);
    } else {
      landlordIds.push(data.id);
      console.log(`✅ 创建房东: ${landlord.name} (${landlord.phone})`);
    }
  }

  // Create tenants
  for (const tenant of tenants) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        phone: tenant.phone,
        name: tenant.name,
        role: 'tenant',
        email: tenant.email
      })
      .select('id')
      .single();
    
    if (error) {
      const { data: existing } = await supabase.from('users').select('id').eq('phone', tenant.phone).single();
      console.log(`租客 ${tenant.name} 已存在`);
    } else {
      console.log(`✅ 创建租客: ${tenant.name} (${tenant.phone})`);
    }
  }

  // Get properties and count by landlord
  const { data: properties } = await supabase.from('properties').select('id, owner_id');
  const propertyIds = properties?.map(p => p.id) || [];

  // Show summary
  console.log('\n=== 数据统计报告 ===');
  console.log(`房东数量: ${landlordIds.length}`);
  console.log(`租客数量: ${tenants.length}`);
  console.log(`房源数量: ${propertyIds.length}`);
  console.log('\n=== 邮箱模板 ===');
  Object.keys(emailTemplates).forEach((key, i) => {
    console.log(`${i+1}. ${key}`);
  });

  console.log('\n✅ 数据生成完成！');
}

seedData().catch(console.error);
