import { layout } from '../components/layout'

export function aboutPage(): string {
  const lang = 'fr'

  const content = `
<!-- Hero -->
<section class="bg-brand-navy py-14 lg:py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6">
    <nav class="text-xs text-gray-400 mb-4">
      <a href="/" class="hover:text-white">Accueil</a>
      <span class="mx-2">/</span>
      <span class="text-gray-300">À propos</span>
    </nav>
    <h1 class="text-3xl lg:text-4xl font-bold text-white tracking-tight">À propos du CRADES</h1>
    <p class="mt-3 text-base text-gray-300 max-w-3xl">Centre de Recherches, d'Analyses des Échanges et Statistiques</p>
  </div>
</section>

<section class="py-12 bg-white">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 text-sm text-gray-600 leading-relaxed space-y-6">

    <div class="text-center space-y-1 text-gray-800">
      <p class="font-semibold uppercase tracking-wide">République du Sénégal</p>
      <p class="text-xs text-gray-500 italic">Un Peuple - Un But - Une Foi</p>
      <p class="font-semibold uppercase tracking-wide mt-3">Ministère du Commerce</p>
      <p class="font-semibold mt-3">Arrêté portant création et organisation du Centre de Recherches, d'Analyses des Échanges et Statistiques (CRADES)</p>
    </div>

    <hr class="border-gray-200">

    <p class="font-semibold text-gray-800">LE MINISTRE DU COMMERCE,</p>

    <p>Vu la Constitution ;</p>
    <p>Vu le décret n° 2007-991 du 7 septembre 2007 relatif aux attributions du Ministre du Commerce ;</p>
    <p>Vu le Décret n° 2009-451 du 30 avril 2009 portant nomination du Premier Ministre ;</p>
    <p>Vu le Décret n° 2010-925 du 8 juillet 2010 portant répartition des services de l'État et du contrôle des établissements publics, des sociétés nationales et des sociétés à participation publique entre la Présidence de la République, la Primature et les ministères ;</p>
    <p>Vu la Convention SN/FED/2009/21529 de financement entre la Commission européenne et la République du Sénégal ;</p>

    <p class="font-semibold text-gray-800 text-center uppercase tracking-wide">Arrêté</p>

    <h3 class="font-semibold text-gray-800">Article premier</h3>
    <p>Il est créé au sein du Ministère du Commerce, un centre de recherche et d'analyse pour l'intelligence économique, l'orientation stratégique, le suivi et l'évaluation d'impact de la politique commerciale, dénommé « Centre de Recherches, d'Analyses des Échanges et Statistiques » (CRADES).</p>
    <p>Le CRADES est rattaché au cabinet du Ministre du Commerce.</p>

    <h3 class="font-semibold text-gray-800">Article 2</h3>
    <p>Sous l'autorité du Ministre du Commerce, le CRADES a pour missions, la recherche, le traitement et l'analyse des statistiques et informations commerciales, en vue de promouvoir le développement du commerce.</p>
    <p>À ce titre, il est chargé :</p>
    <ul class="list-disc pl-6 space-y-2">
      <li>de faire des études et analyses, seul ou en partenariat avec d'autres structures compétentes, en rapport avec la promotion et le développement du commerce ;</li>
      <li>d'assurer de façon permanente, en collaboration avec la Banque Centrale des États de l'Afrique de l'Ouest, l'Agence Nationale de la Statistique et de la Démographie, la Direction de la Prévision et des Études Économiques, la Direction du Commerce Extérieur, l'Agence de Régulation des Marchés, l'Agence Sénégalaise de Promotion des Exportations et le Trade Point Sénégal, la veille commerciale sur l'environnement extérieur de l'économie nationale par l'analyse des risques et des opportunités existants sur les marchés internationaux, ainsi que des caractéristiques des échanges extérieurs ;</li>
      <li>d'assurer, en liaison avec la Direction Générale des Douanes, l'Agence Sénégalaise de Promotion des Exportations, la Direction du Commerce Intérieur, la Direction du Commerce Extérieur, l'Agence Nationale de la Statistique et de la Démographie et les Services de la Banque Centrale, l'analyse et le suivi des contraintes liées au commerce, le suivi des performances commerciales de l'économie, en l'occurrence, celles des principaux biens et services ;</li>
      <li>d'assurer, en relation avec les services concernés, le suivi du système de surveillance commerciale de l'UEMOA, de la CEDEAO, de l'Union Africaine, de l'OCI, de l'OMC etc. ;</li>
      <li>de contribuer, en liaison avec les services concernés, à la formulation de la politique commerciale, au suivi des négociations commerciales internationales et à l'évaluation de l'impact des accords commerciaux régionaux et multilatéraux ainsi que des préférences commerciales dont bénéficie le Sénégal, sur l'économie ;</li>
      <li>d'appuyer les sous-comités du Comité National des Négociations Commerciales Internationales (CNNCI) et toute autre structure par des études et analyses, en rapport avec les sujets traités dans le cadre des négociations commerciales internationales auxquelles participe le Sénégal ou en rapport avec la promotion et le développement du commerce ;</li>
      <li>de contribuer au renforcement des capacités des acteurs des secteurs public et privé et ceux de la société civile, par la communication et la formation sur les règles et pratiques commerciales.</li>
    </ul>

    <h3 class="font-semibold text-gray-800">Article 3</h3>
    <p>En vue de l'exécution de ses missions, le Centre est autorisé à conclure des conventions et des contrats avec des personnes physiques ou morales des secteurs public ou privé.</p>
    <p>En particulier, dans le cadre de ses activités, notamment d'études et de formulation de la politique commerciale, le Centre est autorisé à s'associer les services d'experts extérieurs, le concours d'assistants de recherche et les services de personnels de soutien.</p>
    <p>Les activités du Centre sont coordonnées par un fonctionnaire de la hiérarchie A, nommé par arrêté du Ministre du commerce.</p>

    <h3 class="font-semibold text-gray-800">Article 4</h3>
    <p>Le Centre de Recherches et d'Analyses des Échanges et Statistiques (CRADES) comprend :</p>
    <ul class="list-disc pl-6 space-y-2">
      <li>la Division de la Recherche, de l'Analyse et des Études (DRAE) ;</li>
      <li>la Division de l'Intelligence Économique et de l'Exploitation des Statistiques (DIEES) ;</li>
      <li>la Division de la Documentation Commerciale et de la Communication (DDCC).</li>
    </ul>

    <h3 class="font-semibold text-gray-800">Article 5</h3>
    <p>1. Le Centre est administré par un Conseil d'orientation qui délègue à un Coordonnateur, tous les pouvoirs nécessaires au bon fonctionnement du Centre, cette délégation devant être approuvée par le Ministre du Commerce. Le Conseil d'orientation est présidé par le Ministre du Commerce et comprend dix-sept membres, nommés et révoqués par arrêté du Ministre du Commerce, après avis des responsables des structures visées par la liste ci-après :</p>
    <ul class="list-disc pl-6 space-y-1">
      <li>un représentant de la Présidence de la République ;</li>
      <li>un représentant de la Primature ;</li>
      <li>un représentant du Ministre de l'Économie et des Finances ;</li>
      <li>un représentant du Ministre chargé de l'industrie ;</li>
      <li>un représentant du Ministre chargé de l'agriculture ;</li>
      <li>un représentant du Ministre chargé de l'élevage ;</li>
      <li>un représentant du Ministre chargé du tourisme ;</li>
      <li>un représentant du Ministre chargé de l'économie maritime ;</li>
      <li>un représentant de chacun des Partenaires techniques et financiers contribuant au financement des activités du Centre ;</li>
      <li>un représentant de la CNES ;</li>
      <li>un représentant du CNP ;</li>
      <li>un représentant du MEDS ;</li>
      <li>un représentant de l'ENAC ;</li>
      <li>un représentant du CONGAD ;</li>
      <li>un représentant de l'UNACOIS/UAPPC ;</li>
      <li>un représentant de l'Université Cheikh Anta DIOP de Dakar ;</li>
      <li>un représentant de l'Université Gaston Berger de Saint-Louis.</li>
    </ul>

    <p>2. Le Conseil choisit parmi ses membres un vice-président ;</p>
    <p>3. Les membres du Conseil d'orientation sont nommés pour une durée de deux ans renouvelables à son terme ;</p>
    <p>4. Le Ministre du Commerce peut révoquer un membre avant l'expiration de son mandat sur proposition du responsable de son organisation d'origine, et après avis du Conseil d'orientation ;</p>
    <p>5. En cas de démission, de décès ou de révocation avant terme du mandat d'un membre du Conseil d'orientation, il est pourvu à son remplacement par la nomination d'un nouveau membre qui achève le mandat de celui qu'il remplace ;</p>
    <p>6. Le Conseil d'orientation se réunit au moins une fois tous les trois mois sur convocation de son président. Il peut également être convoqué à la demande de deux de ses membres. Le délai de convocation est de cinq jours, sauf en cas d'urgence à apprécier par le président du Conseil. La convocation indique l'ordre du jour, la date et le lieu de la réunion ;</p>
    <p>7. Le Conseil d'orientation ne peut valablement délibérer que si la majorité de ses membres est présente. Il décide à la majorité simple des voix des membres présents. En cas d'égalité de voix, le vote du président de séance est prépondérant ;</p>
    <p>8. Le Conseil d'orientation a la faculté de recourir à l'avis d'experts indépendants s'il le juge nécessaire, lesquels experts peuvent assister avec voix consultative aux réunions du Conseil d'orientation, si celui-ci le leur demande.</p>
    <p>9. Le Coordonnateur du Centre assiste aux réunions du Conseil d'orientation et en assure le secrétariat.</p>

    <h3 class="font-semibold text-gray-800">Article 6</h3>
    <p>Le Conseil d'orientation approuve le manuel de procédures et le règlement intérieur du Centre. Sous réserve de l'approbation du ministre de tutelle, il décide sur les points portant sur :</p>
    <ul class="list-disc pl-6 space-y-1">
      <li>le budget d'investissement et de fonctionnement ;</li>
      <li>l'organigramme, la grille des emplois et leur classification ainsi que les conditions et modalités de rémunération et le volume des tâches du personnel ;</li>
      <li>la motivation des membres du Conseil d'orientation et du Comité technique ;</li>
      <li>l'acceptation et le refus de dons, legs ou autres ressources ;</li>
      <li>les orientations générales quant aux utilisations et activités du Centre ;</li>
      <li>le rapport général d'activités ;</li>
      <li>les actions judiciaires à intenter et les transactions à conclure ;</li>
      <li>les conventions à conclure ;</li>
      <li>l'engagement des personnels du Centre.</li>
    </ul>
    <p>Les décisions qui ont une incidence directe sur le budget de l'État sont soumises à l'approbation du Ministre du Commerce.</p>
    <p>Les actions judiciaires sont intentées et défendues au nom du Centre par son Coordonnateur.</p>
    <p>Le Conseil d'orientation adopte un règlement intérieur déterminant les modalités de son fonctionnement. Ce règlement est soumis à l'approbation du ministre de tutelle et de celle des partenaires contribuant au financement du Centre.</p>
    <p>Le Ministre du Commerce peut suspendre provisoirement les décisions du Conseil d'orientation lorsqu'il estime qu'elles sont contraires aux lois, aux règlements ou aux objectifs du Centre. Dans ce cas, il peut déclarer la suspension définitive dans un délai de deux mois après en avoir saisi les partenaires contribuant au financement du Centre, la date de l'accusé de réception faisant foi.</p>

    <h3 class="font-semibold text-gray-800">Article 7</h3>
    <p>Le Conseil d'orientation est assisté par un Comité technique composé de représentants :</p>
    <ul class="list-disc pl-6 space-y-1">
      <li>du Conseil Économique et Social (CES) ;</li>
      <li>de l'Agence Nationale de la Banque Centrale des États de l'Afrique de l'Ouest (BCEAO) ;</li>
      <li>du Centre d'Études et de Politique pour le Développement (CEPOD) ;</li>
      <li>de la Direction de la Prévision et des Études Économiques ;</li>
      <li>de l'Agence Nationale de la Statistique et de la Démographie ;</li>
      <li>de la Direction de l'Analyse, de la Prévision et de la Statistique du Ministère de l'Agriculture ;</li>
      <li>de l'Unité de Coordination et de Suivi de la Politique Économique du Ministère de l'Économie et des Finances ;</li>
      <li>de la Direction Générale des Douanes (DGD) ;</li>
      <li>de la Direction de l'Horticulture ;</li>
      <li>de la Direction de l'Industrie (DI) ;</li>
      <li>de la Direction de la Pêche ;</li>
      <li>de la Direction de l'Élevage ;</li>
      <li>de la Direction de la Transformation des produits alimentaires ;</li>
      <li>de la Direction du Commerce Extérieur (DCE) ;</li>
      <li>de la Direction du Commerce Intérieur (DCI) ;</li>
      <li>de l'Agence de Régulation des Marchés (ARM) ;</li>
      <li>de l'Agence Sénégalaise de Promotion des Exportations (ASEPEX) ;</li>
      <li>du Trade Point Sénégal (TPS) ;</li>
      <li>de l'Observatoire Économique de la Chambre de Commerce, d'Industrie et d'Agriculture de Dakar (CCIAD) ;</li>
      <li>de l'Institut de Recherche Agricole (ISRA-BAM) ;</li>
      <li>du Centre de Recherche et d'Économie Appliquée (CREA) ;</li>
      <li>du Consortium pour la Recherche Économique et Sociale (CRES) ;</li>
      <li>du Centre de Recherche pour la Formation et le Développement Économique et Social (CFREDES) ;</li>
      <li>du Conseil National du Patronat (CNP) ;</li>
      <li>de la Confédération Nationale des Travailleurs du Sénégal (CNTS) ;</li>
      <li>du Mouvement des Entreprises du Sénégal (MEDS).</li>
    </ul>
    <p>Le Comité technique se réunit sur convocation du Président du Conseil d'orientation.</p>

    <h3 class="font-semibold text-gray-800">Article 8</h3>
    <p>Les ressources du Centre proviennent notamment :</p>
    <ol class="list-decimal pl-6 space-y-1">
      <li>des contributions inscrites au budget de l'État ;</li>
      <li>des dons accordés par les partenaires techniques et financiers contribuant au financement des activités du Centre ;</li>
      <li>du remboursement par des tiers de services et de prestations offerts ;</li>
      <li>d'autres dons et legs.</li>
    </ol>

    <h3 class="font-semibold text-gray-800">Article 9</h3>
    <p>Des locaux, des installations et des équipements, appartenant à l'État ou loués par l'État, sont mis à la disposition du Centre. La gestion du matériel et des équipements fait l'objet d'un suivi en comptabilité matières.</p>

    <h3 class="font-semibold text-gray-800">Article 10</h3>
    <p>Le présent arrêté entre en vigueur à compter de sa date de signature. Il sera enregistré, communiqué et publié partout où besoin sera.</p>

    <p class="text-center font-semibold text-gray-800">Le Ministre du Commerce,<br>Amadou NIANG</p>

  </div>
</section>
`

  return layout(content, { title: 'À propos', path: '/a-propos', lang })
}
