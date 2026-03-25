export const metadata = {
  title: '租好 - 用户协议',
  description: '租好平台用户协议',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">用户协议</h1>
        
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. 服务条款</h2>
            <p className="text-gray-600 leading-relaxed">
              欢迎使用租好平台！本用户协议（以下称&quot;本协议&quot;）规定了您与租好平台之间的权利和义务。
              请您在使用我们的服务前仔细阅读本协议。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. 服务描述</h2>
            <p className="text-gray-600 leading-relaxed">
              租好是一个提供租房信息发布、房屋管理、租金收取等服务的平台。
              我们致力于帮助房东更好地管理房源，帮助租客更方便地找到合适的房子。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. 用户义务</h2>
            <ul className="text-gray-600 leading-relaxed list-disc list-inside space-y-2">
              <li>提供真实、准确的个人信息</li>
              <li>遵守中华人民共和国法律法规</li>
              <li>不发布虚假房源信息</li>
              <li>保护账户安全，不向他人泄露账户信息</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. 隐私保护</h2>
            <p className="text-gray-600 leading-relaxed">
              我们非常重视用户隐私。根据《个人信息保护法》，我们只会收集提供服务所必需的信息，
              并采取严格的安全措施保护您的数据。详情请查看我们的《隐私政策》。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. 押金规定</h2>
            <p className="text-gray-600 leading-relaxed">
              根据中国法律规定，房东收取的押金不得超过2个月租金。
              退租时，房东应在扣除合理费用后全额退还押金。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. 服务费用</h2>
            <p className="text-gray-600 leading-relaxed">
              租好平台基础功能免费使用。增值服务（电子合同、高级报表等）可能收取一定费用，
              具体费用标准将在服务页面明确展示。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. 免责声明</h2>
            <p className="text-gray-600 leading-relaxed">
              用户在使用本平台时，应自行判断信息的真实性。
              对于因使用本平台而产生的任何直接或间接损失，租好平台不承担责任。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. 协议变更</h2>
            <p className="text-gray-600 leading-relaxed">
              我们可能随时修改本协议。修改后的协议将在平台上公布，
              继续使用服务即表示您接受修改后的协议。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. 联系我们</h2>
            <p className="text-gray-600 leading-relaxed">
              如有任何问题，请联系我们的客服。
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
