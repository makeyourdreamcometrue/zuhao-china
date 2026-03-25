const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hedvkncylfkudabbtpzt.supabase.co';
const supabaseKey = 'sb_publishable_0kftv5iPegZ886vU3UFD6Q_5vyxpJpe';
const supabase = createClient(supabaseUrl, supabaseKey);

// 20 unique interior photo sets (5 each)
const photos = [
  ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800','https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
  ['https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800','https://images.unsplash.com/photo-1600573472591-ee6c563aaec3?w=800','https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800'],
  ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800','https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=800','https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800','https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'],
  ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800','https://images.unsplash.com/photo-1600573472591-ee6c563aaec3?w=800','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'],
  ['https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800','https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=800','https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800','https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'],
  ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800','https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
  ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800','https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800','https://images.unsplash.com/photo-1600573472591-ee6c563aaec3?w=800'],
  ['https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800','https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=800','https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800','https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'],
  ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800','https://images.unsplash.com/photo-1600573472591-ee6c563aaec3?w=800','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'],
  ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800','https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
  ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800','https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800','https://images.unsplash.com/photo-1600573472591-ee6c563aaec3?w=800'],
  ['https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800','https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=800','https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800','https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'],
  ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800','https://images.unsplash.com/photo-1600573472591-ee6c563aaec3?w=800','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'],
  ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800','https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
  ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800','https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800','https://images.unsplash.com/photo-1600573472591-ee6c563aaec3?w=800'],
  ['https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800','https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=800','https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800','https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'],
  ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800','https://images.unsplash.com/photo-1600573472591-ee6c563aaec3?w=800','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'],
  ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800','https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
  ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800','https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800','https://images.unsplash.com/photo-1600573472591-ee6c563aaec3?w=800'],
  ['https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800','https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=800','https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800','https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800']
];

const properties = [
  { title: '天河CBD精装两房，拎包入住', description: '位于天河区核心地段，周边配套齐全，交通便利。', address: '天河区天河路385号', city: '广州', area: 85, rooms: 2, rent: 4500, deposit: 9000 },
  { title: '珠江新城豪华三房，江景房', description: '一线江景豪华装修，三房两卫，视野开阔。', address: '天河区珠江新城花城大道68号', city: '广州', area: 140, rooms: 3, rent: 12000, deposit: 24000 },
  { title: '海珠区江南西地铁口单间', description: '地铁上盖，出行非常方便。', address: '海珠区江南西路66号', city: '广州', area: 35, rooms: 1, rent: 2200, deposit: 4400 },
  { title: '番禺长隆板块复式公寓', description: '复式loft结构，年轻人首选。', address: '番禺区汉溪大道长隆旅游度假区', city: '广州', area: 60, rooms: 2, rent: 3500, deposit: 7000 },
  { title: '荔湾区上下九老城区一房一厅', description: '老广州味道，周边美食林立。', address: '荔湾区上下九步行街附近', city: '广州', area: 50, rooms: 1, rent: 1800, deposit: 3600 },
  { title: '白云区三元里地铁站三房出租', description: '大型社区，环境优美，绿化率高。', address: '白云区三元里大道128号', city: '广州', area: 110, rooms: 3, rent: 3800, deposit: 7600 },
  { title: '越秀区北京路学区房两房', description: '名校学区房，优质教育资源。', address: '越秀区北京路文德路交界', city: '广州', area: 75, rooms: 2, rent: 4200, deposit: 8400 },
  { title: '黄埔区科学城IT男神聚集地', description: '科学城核心区域，众多科技公司就在附近。', address: '黄埔区科学城开创大道', city: '广州', area: 90, rooms: 2, rent: 3200, deposit: 6400 },
  { title: '花都区融创文旅城旁两房', description: '临近融创雪世界、游乐园，周末娱乐方便。', address: '花都区融创文旅城', city: '广州', area: 80, rooms: 2, rent: 2500, deposit: 5000 },
  { title: '增城区新塘TOD枢纽单间', description: 'TOD交通枢纽，出行极其便利。', address: '增城区新塘高铁站旁', city: '广州', area: 40, rooms: 1, rent: 1600, deposit: 3200 },
  { title: '天河区岗顶电脑城旁两房', description: '岗顶IT商圈，数码天堂。', address: '天河区岗顶石牌西路', city: '广州', area: 72, rooms: 2, rent: 3800, deposit: 7600 },
  { title: '番禺区大学城教师公寓', description: '大学城内，环境优雅，书香气息浓厚。', address: '番禺区大学城中环西路', city: '广州', area: 65, rooms: 2, rent: 2800, deposit: 5600 },
  { title: '荔湾区沙面欧陆风情房', description: '沙面岛上，历史建筑保护区，欧陆风情浓郁。', address: '荔湾区沙面大街', city: '广州', area: 55, rooms: 1, rent: 3200, deposit: 6400 },
  { title: '海珠区琶洲会展中心旁公寓', description: '琶洲会展商圈，展会期间租金略高但前景好。', address: '海珠区琶洲大道保利广场', city: '广州', area: 50, rooms: 1, rent: 4000, deposit: 8000 },
  { title: '白云区嘉禾望岗地铁三房', description: '双地铁交汇，交通枢纽位置。', address: '白云区嘉禾望岗望岗大道', city: '广州', area: 95, rooms: 3, rent: 3300, deposit: 6600 },
  { title: '天河区五山高校教师楼', description: '五山高校区，学术氛围浓厚。', address: '天河区五山路华南理工大学', city: '广州', area: 80, rooms: 2, rent: 3600, deposit: 7200 },
  { title: '越秀区东山口民国风两房', description: '东山口老广州记忆，民国建筑风格。', address: '越秀区东山口龟岗大马路', city: '广州', area: 68, rooms: 2, rent: 3500, deposit: 7000 },
  { title: '番禺区市桥地铁口两房', description: '市桥老城区核心位置，生活配套最完善。', address: '番禺区市桥街光明南路', city: '广州', area: 75, rooms: 2, rent: 2000, deposit: 4000 },
  { title: '黄埔区知识城人才公寓', description: '中新知识城板块，高新技术产业聚集区。', address: '黄埔区知识城凤凰湖旁', city: '广州', area: 85, rooms: 2, rent: 2600, deposit: 5200 },
  { title: '天河区珠江公园旁豪宅', description: '珠江公园隔壁，天然氧吧，跑步健身好去处。', address: '天河区珠江公园西侧', city: '广州', area: 180, rooms: 4, rent: 15000, deposit: 30000 }
];

async function insertAll() {
  const { data: users } = await supabase.from('users').select('id').eq('role', 'landlord').limit(1);
  const ownerId = users[0].id;
  
  const data = properties.map((p, i) => ({
    ...p,
    owner_id: ownerId,
    photos: photos[i],
    status: 'available'
  }));

  const { error } = await supabase.from('properties').insert(data);
  
  if (error) { console.error('Error:', error); return; }
  console.log('✅ 成功插入20条房源，每条5张照片！');
}

insertAll();
