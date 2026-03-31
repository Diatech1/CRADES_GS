import { layout } from '../components/layout'

export function contactPage(): string {
  const lang = 'fr'

  const content = `
<!-- Hero -->
<section class="bg-brand-navy py-14 lg:py-18">
  <div class="max-w-7xl mx-auto px-4 sm:px-6">
    <nav class="text-xs text-gray-400 mb-4">
      <a href="/" class="hover:text-white">Accueil</a>
      <span class="mx-2">/</span>
      <span class="text-gray-300">Contact</span>
    </nav>
    <h1 class="text-3xl lg:text-4xl font-bold text-white tracking-tight">Contact</h1>
    <p class="mt-3 text-base text-gray-300 max-w-3xl">Une question, une demande de données ou un partenariat ? Contactez-nous.</p>
  </div>
</section>

<section class="py-12 bg-gray-50">
  <div class="max-w-5xl mx-auto px-4 sm:px-6">
    <div class="grid lg:grid-cols-[1fr_320px] gap-8">

      <!-- Form -->
      <div class="bg-white rounded-xl border border-gray-100 p-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">Envoyez-nous un message</h2>
        <form id="contactForm" class="space-y-5" onsubmit="event.preventDefault(); document.getElementById('contactStatus').className='text-sm py-2 px-3 rounded-lg bg-emerald-50 text-emerald-700'; document.getElementById('contactStatus').textContent='Message envoyé avec succès. Nous vous répondrons dans les meilleurs délais.'; document.getElementById('contactStatus').classList.remove('hidden');">
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Nom complet *</label>
              <input type="text" name="name" required class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input type="email" name="email" required class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20">
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Organisation</label>
            <input type="text" name="organization" class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Sujet</label>
            <select name="subject" class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue bg-white">
              <option value="">Choisir...</option>
              <option>Demande de données</option>
              <option>Partenariat</option>
              <option>Question générale</option>
              <option>Signaler un problème</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Message *</label>
            <textarea name="message" rows="5" required class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 resize-none"></textarea>
          </div>
          <div id="contactStatus" class="hidden text-sm py-2 px-3 rounded-lg"></div>
          <button type="submit" class="bg-brand-blue text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-navy transition-colors">
            Envoyer
          </button>
        </form>
      </div>

      <!-- Sidebar -->
      <aside class="space-y-6">
        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <h3 class="text-sm font-semibold text-gray-800 mb-4">Coordonnées</h3>
          <div class="space-y-4 text-sm">
            <div class="flex items-start gap-3">
              <i class="fas fa-map-marker-alt text-brand-blue mt-0.5"></i>
              <div class="text-gray-600">Rue Aimé Césaire, Plateau<br>Dakar, Sénégal</div>
            </div>
            <div class="flex items-center gap-3">
              <i class="fas fa-phone text-brand-blue"></i>
              <span class="text-gray-600">+221 33 889 12 34</span>
            </div>
            <div class="flex items-center gap-3">
              <i class="fas fa-envelope text-brand-blue"></i>
              <a href="mailto:contact@crades.gouv.sn" class="text-brand-blue hover:underline">contact@crades.gouv.sn</a>
            </div>
          </div>
        </div>
        <div class="bg-brand-frost rounded-xl p-6">
          <h3 class="text-sm font-semibold text-gray-800 mb-2">Horaires</h3>
          <p class="text-xs text-gray-500">Lundi - Vendredi : 8h00 - 17h00</p>
          <p class="text-xs text-gray-400 mt-1">Samedi, Dimanche : Fermé</p>
        </div>
      </aside>
    </div>
  </div>
</section>
`

  return layout(content, { title: 'Contact', path: '/contact', lang })
}
