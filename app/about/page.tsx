export const metadata = {
  title: '租好 - 关于我们',
  description: '关于租好平台',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">让租房更简单</h1>
          <p className="text-xl opacity-90">租好 - 专业的租房管理平台</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Mission */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">我们的使命</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            租好致力于解决中国租房市场的痛点：房源信息不透明、流程繁琐、租金收取麻烦。
            我们为房东提供一站式管理工具，让租房变得简单、高效、透明。
          </p>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">核心功能</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">房源管理</h3>
              <p className="text-gray-600">一键发布房源，智能管理多个租房，节省时间</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">租客筛选</h3>
              <p className="text-gray-600">查看租客申请，筛选优质租客，降低风险</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">自动收租</h3>
              <p className="text-gray-600">自动提醒收租，告别催租烦恼</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">电子合同</h3>
              <p className="text-gray-600">在线签约，无需见面，安全便捷</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">平台数据</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="text-3xl font-bold text-blue-600">10,000+</div>
              <div className="text-gray-500 mt-1">房源数量</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="text-3xl font-bold text-green-600">5,000+</div>
              <div className="text-gray-500 mt-1">活跃房东</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="text-3xl font-bold text-purple-600">50,000+</div>
              <div className="text-gray-500 mt-1">租客用户</div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">联系我们</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-600 mb-4">有任何问题？请联系我们</p>
            <ul className="space-y-2 text-gray-600">
              <li>📧 邮箱: support@zuhao.com</li>
              <li>📱 电话: 400-888-8888</li>
              <li>🕐 工作时间: 周一至周五 9:00-18:00</li>
            </ul>
          </div>
        </section>

        {/* Links */}
        <section>
          <div className="flex justify-center gap-6">
            <a href="/terms" className="text-blue-600 hover:underline">用户协议</a>
            <a href="/privacy" className="text-blue-600 hover:underline">隐私政策</a>
          </div>
          <p className="text-center text-gray-400 mt-6">
            © 2026 租好. All rights reserved.
          </p>
        </section>
      </div>
    </div>
  )
}
