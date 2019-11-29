**La version actuelle de Cookieviz n'est plus maintenue et son installeur ne fonctionne pas avec les dernières génération de Windows. Une nouvelle version sera proposée au téléchargement en janvier 2020.**

CookieViz
===
[![Issue Stats](http://issuestats.com/github/LaboCNIL/CookieViz/badge/pr)](http://issuestats.com/github/LaboCNIL/CookieViz)
[![Issue Stats](http://issuestats.com/github/LaboCNIL/CookieViz/badge/issue)](http://issuestats.com/github/LaboCNIL/CookieViz)

**CookieViz est outil de visualisation qui permet de mesurer l'impact des cookies lors de votre propre navigation.**

Concrètement, Cookieviz analyse les interactions entre votre ordinateur, votre navigateur et des sites et serveurs distants. En l'installant vous pourrez savoir à quels autres acteurs le site que vous visitez envoie des informations.

Une vidéo présentant le fonctionnement de l'outil est disponible sur Youtube à l'adresse suivante: http://www.youtube.com/watch?v=5UJGlDPRLCw.

Installation
--

**Windows**

Pour installer CookieViz sur Windows, vous pouvez télécharger le fichier ``setup.exe`` disponible dans la tag "RELEASE" de Github.

**Mac OS X et Linux**

Pour déployer le logiciel sur Linux et sur MAC, vous devez disposer d'un serveur web, un serveur de base de données MySQL, et PHP5.

Il existe deux versions du logiciel de détection des cookies. La première version du logiciel s'appuie sur le binaire ``tshark``. La seconde s'appuie sur le binaire ``mitmdump``. Seule la version ``mitmdump`` permet de surveiller l'utilisation des cookies par des sites tiers utilisant le protocole https.

Selon la version, il sera nécessaire d'installer ``tshark`` ou ``mitmproxy``.

Il faut ensuite déplacer le répertoire cookieviz à la racine de votre serveur web.
Puis, déposer le répertoire soft dans le répertoire de votre choix.
Enfin, il est nécessaire de modifier les paramètres de connexion à la base de données dans les fichiers suivants :

 * ``cookieviz/settings.inc``
 * ``soft/monitor_tshark_osx.php``
 * ``soft/monitor_mitmdump.php``

Utilisation
--

Pour lancer la surveillance de l'utilisation des cookies, il faut alors exécuter les commandes suivantes dans un terminal:

**Pour la version tshark:**

``php /chemin vers le répertoire soft/monitor_tshark_osx.php <index de la carte réseau utilisée pour communiquer sur internet>``

**Pour la version mitmpdump:**

``php /chemin vers le répertoire soft/monitor_mitmdump.php``

Pour la version ``mitmdump``, l'application se comporte comme un proxy. Il est donc nécessaire de paramétrer le proxy soit au niveau du navigateur, soit au niveau du système.

L'adresse du proxy est la suivante: ``localhost:8080``

Vous pouvez ensuite naviguer comme auparavant sur des sites web.
Vous pouvez constater le résultat en vous connectant avec un navigateur sur votre serveur web ``http://adresse_de_votre_serveur/cookieviz/``

Contribuer
--

**CookieViz est disponible sous license GPLv3 et peut être enrichi par chacun des utilisateurs.** Les plus expérimentés peuvent améliorer cette version initiale de notre outil ou corriger d’éventuels bugs. N'oubliez pas de soumettre vos contributions via des pull-requests.

**Vous avez une idée que vous souhaitez partager avec nous pour améliorer ce projet ?** Vous avez envie de vous appuyer sur cette base pour construire un projet de pédagogie de la traçabilité numérique ? Vous pouvez contacter le créateur de l'application via le compte Twitter [@StephanePetitco](https://twitter.com/StephanePetitco). Contactez l’équipe du laboratoire CNIL par mail - ip(at)cnil.fr - ou via le compte Twitter [@LINCnil](https://twitter.com/LINCnil).

Pour de plus amples informations, voir le fichier ``LICENSE`` inclus.
