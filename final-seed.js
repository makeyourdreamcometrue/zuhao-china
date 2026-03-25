const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hedvkncylfkudabbtpzt.supabase.co';
const supabaseKey = 'sb_publishable_0kftv5iPegZ886vU3UFD6Q_5vyxpJpe';
const supabase = createClient(supabaseUrl, supabaseKey);

const p1 = ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800','https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'];
const p2 = ['https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800','https://images.unsplash.com/photo-1600573472591-ee6c563aaec3?w=800','https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800'];
const p3 = ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800','https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=800','https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800','https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'];
const p4 = ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800','https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800','https://images.unsplash.com/photo-1600573472591-ee6c563aaec3?w=800','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'];
const p5 = ['https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800','https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=800','https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800','https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'];

async function main() {
  const { data: users } = await supabase.from('users').select('id').eq('role', 'landlord').limit(1);
  const ownerId = users[0].id;

  const props = [
    { title: '天河CBD精装两房', address: '天河天河路', area: 85, rooms: 2, rent: 4500, deposit: 9000, photos: p1 },
    { title: '珠江新城豪华三房', address: '天河珠江新城', area: 140, rooms: 3, rent: 12000, deposit: 24000, photos: p2 },
    { title: '海珠区江南西单间', address: '海珠江南西路', area: 35, rooms: 1, rent: 2200, deposit: 4400, photos: p3 },
    { title: '番禺长隆复式公寓', address: '番禺长隆', area: 60, rooms: 2, rent: 3500, deposit: 7000, photos: p4 },
    { title: '荔湾上下九一房', address: '荔湾上下九', area: 50, rooms: 1, rent: 1800, deposit: 3600, photos: p5 },
    { title: '白云三元里三房', address: '白云三元里', area: 110, rooms: 3, rent: 3800, deposit: 7600, photos: p1 },
    { title: '越秀北京路两房', address: '越秀北京路', area: 75, rooms: 2, rent: 4200, deposit: 8400, photos: p2 },
    { title: '黄埔科学城两房', address: '黄埔科学城', area: 90, rooms: 2, rent: 3200, deposit: 6400, photos: p3 },
    { title: '花都融创两房', address: '花都融创', area: 80, rooms: 2, rent: 2500, deposit: 5000, photos: p4 },
    { title: '增城新塘单间', address: '增城新塘', area: 40, rooms: 1, rent: 1600, deposit: 3200, photos: p5 },
    { title: '天河岗顶两房', address: '天河岗顶', area: 72, rooms: 2, rent: 3800, deposit: 7600, photos: p1 },
    { title: '番禺大学城公寓', address: '番禺大学城', area: 65, rooms: 2, rent: 2800, deposit: 5600, photos: p2 },
    { title: '荔湾沙面风情房', address: '荔湾沙面', area: 55, rooms: 1, rent: 3200, deposit: 6400, photos: p3 },
    { title: '海珠琶洲公寓', address: '海珠琶洲', area: 50, rooms: 1, rent: 4000, deposit: 8000, photos: p4 },
    { title: '白云嘉禾望岗三房', address: '白云嘉禾望岗', area: 95, rooms: 3, rent: 3300, deposit: 6600, photos: p5 },
    { title: '天河五山教师楼', address: '天河五山', area: 80, rooms: 2, rent: 3600, deposit: 7200, photos: p1 },
    { title: '越秀东山口两房', address: '越秀东山口', area: 68, rooms: 2, rent: 3500, deposit: 7000, photos: p2 },
    { title: '番禺市桥两房', address: '番禺市桥', area: 75, rooms: 2, rent: 2000, deposit: 4000, photos: p3 },
    { title: '黄埔知识城公寓', address: '黄埔知识城', area: 85, rooms: 2, rent: 2600, deposit: 5200, photos: p4 },
    { title: '天河珠江公园豪宅', address: '天河珠江公园', area: 180, rooms: 4, rent: 15000, deposit: 30000, photos: p5 },
  ];

  for (const prop of props) {
    await supabase.from('properties').insert({
      ...prop,
      description: prop.title + '，精装修，拎包入住',
      city: '广州',
      owner_id: ownerId,
      status: 'available'
    });
    console.log('Inserted:', prop.title);
  }

  console.log('✅ Done!');
}

main();
