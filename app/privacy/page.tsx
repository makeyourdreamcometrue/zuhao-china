export const metadata = {
  title: '租好 - 隐私政策',
  description: '租好平台隐私政策',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">隐私政策</h1>
        
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">引言</h2>
            <p className="text-gray-600 leading-relaxed">
              租好（以下简称&quot;我们&quot;）非常重视用户的隐私保护。
              本隐私政策解释了我们在您使用租好平台服务时如何收集、使用、存储和保护您的个人信息。
              根据《中华人民共和国个人信息保护法》，我们制定了本政策。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">我们收集的信息</h2>
            <ul className="text-gray-600 leading-relaxed list-disc list-inside space-y-2">
              <li><strong>基本个人信息：</strong>手机号、姓名、身份证信息（实名认证时）</li>
              <li><strong>房源信息：</strong>房屋地址、照片、租金价格</li>
              <li><strong>交易信息：</strong>租金支付记录、租赁合同</li>
              <li><strong>使用数据：</strong>浏览记录、操作行为（用于改善服务）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">我们如何使用信息</h2>
            <ul className="text-gray-600 leading-relaxed list-disc list-inside space-y-2">
              <li>提供租房管理服务</li>
              <li>验证用户身份</li>
              <li>处理租金支付</li>
              <li>发送重要通知</li>
              <li>改善我们的服务</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">信息共享</h2>
            <p className="text-gray-600 leading-relaxed">
              我们不会出售您的个人信息。在以下情况下，我们可能分享您的信息：
            </p>
            <ul className="text-gray-600 leading-relaxed list-disc list-inside space-y-2 mt-2">
              <li>经您同意后分享</li>
              <li>为提供服务而与合作伙伴共享（如支付机构）</li>
              <li>法律法规要求时</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">信息安全</h2>
            <p className="text-gray-600 leading-relaxed">
              我们采用行业标准的安全措施保护您的数据：
            </p>
            <ul className="text-gray-600 leading-relaxed list-disc list-inside space-y-2 mt-2">
              <li>数据加密传输（HTTPS）</li>
              <li>敏感信息加密存储</li>
              <li>严格的访问控制</li>
              <li>定期安全审计</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">您的权利</h2>
            <p className="text-gray-600 leading-relaxed">
              根据《个人信息保护法》，您享有以下权利：
            </p>
            <ul className="text-gray-600 leading-relaxed list-disc list-inside space-y-2 mt-2">
              <li><strong>访问权：</strong>查看我们保存的您的个人信息</li>
              <li><strong>更正权：</strong>修改不准确的信息</li>
              <li><strong>删除权：</strong>要求删除您的个人信息</li>
              <li><strong>注销账户：</strong>可随时注销账户</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Cookie政策</h2>
            <p className="text-gray-600 leading-relaxed">
              我们使用Cookie来改善用户体验。Cookie是存储在您设备上的小文件，
              可以帮助我们记住您的偏好。您可以在浏览器设置中禁用Cookie，
              但这可能影响部分功能。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">未成年人保护</h2>
            <p className="text-gray-600 leading-relaxed">
              我们的服务主要面向成年人。如果您是未满18周岁的未成年人，
              请在父母或监护人的指导下使用服务。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">政策更新</h2>
            <p className="text-gray-600 leading-relaxed">
              我们可能不时更新本隐私政策。更新后的政策将在平台上公布，
              并标明最新更新日期。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">联系我们</h2>
            <p className="text-gray-600 leading-relaxed">
              如您对本隐私政策有任何疑问，请联系我们的客服。
            </p>
          </section>

          <div className="text-sm text-gray-400 pt-4 border-t">
            <p>最后更新日期: 2026年3月23日</p>
          </div>
        </div>
      </div>
    </div>
  )
}
