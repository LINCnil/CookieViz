CookieViz
===

**Cette version de CookieViz vous permet d'analyser les systèmes de protection de vos navigateurs**

Elle consiste en la mise en place d'un proxy qui analyse l'ensemble des cookies transitant entre les serveurs et votre navigateur.

Il vous ai donné plusieurs possibilité afin de tester ces fonctionnalités :
*  **depuis le docker déposé sur Docker Hub**,
*  **en construisant votre propre docker depuis le code source déposée sur GitHub**,
*  **en configurant votre système depuis le code source**.

Une fois ce proxy mis en place, vous devez configurer le navigateur à tester pour initier l'analyse. [Configurer le proxy de votre navigateur](https://fr.wikihow.com/changer-les-param%C3%A8tres-de-proxy) sur l'adresse suivante : ``localhost:8080``.

Entrer l'url ``locahost`` afin d'afficher les résultats de votre analyse. Pour déchiffrer les communications de votre navigateur, vous devez également installer un certificat spécifique sur votre navigateur, en cliquant sur le lien "Récupérer le certificat de déchiffrement" sur la partie gauche de CookieViz. 

Vous pouvez ensuite naviguer comme auparavant sur des sites web.

**Utiliser le docker depuis Docker Hub**
Installer docker sur votre ordinateur depuis l'un des liens suivants : [Windows](https://docs.docker.com/docker-for-mac/install/), [Mac](https://docs.docker.com/docker-for-mac/install/) ou [Linux](https://docs.docker.com/install/linux/docker-ce/ubuntu/).

Ouvrez votre terminal/invite de commande et entrer les lignes suivantes :
 * ``docker pull cnil/cookieviz``
 * ``docker run cnil/cookieviz``

**Construire votre propre docker**

Cloner la branche actuelle : ``git clone -b docker https://github.com/LINCnil/CookieViz``

Ouvrez votre terminal/invite de commande à la racine du projet et entrer les lignes suivantes :
 * ``docker build -t cookieviz``
 * ``docker run cookieviz``

**Utilisation sans docker sur Windows, Mac OS X et Linux**

Pour déployer le logiciel sur Windows, Linux et sur MAC, vous devez disposer d'un serveur web, un serveur de base de données MySQL, et PHP5. Il sera nécessaire d'installer [mitmproxy](https://mitmproxy.org/).

Il faut ensuite déplacer le répertoire cookieviz à la racine de votre serveur web.
Puis, déposer le répertoire soft dans le répertoire de votre choix.
Enfin, il est nécessaire de modifier les paramètres de connexion à la base de données dans les fichiers suivants :

 * ``cookieviz/settings.inc``
 * ``soft/monitor_mitmdump.py``

Pour lancer la surveillance de l'utilisation des cookies, il suffier d'exécuter les commandes suivantes dans un terminal:

``mitmdump -s ./soft/monitor_mitmdump.py``

L'application se comporte comme un proxy. Il est donc nécessaire de paramétrer le proxy soit au niveau du navigateur, soit au niveau du système.

L'adresse du proxy est la suivante: ``localhost:8080``. Pour déchiffrer les communications de votre navigateur, vous devez également installer le certificat mitm en suivant cette [procédure](https://docs.mitmproxy.org/stable/concepts-certificates/) 

Vous pouvez ensuite naviguer comme auparavant sur des sites web.
Vous pouvez constater le résultat en vous connectant avec un navigateur sur votre serveur web ``http://adresse_de_votre_serveur/cookieviz/``.

Contribuer
--

**CookieViz est disponible sous license GPLv3 et peut être enrichi par chacun des utilisateurs.** Les plus expérimentés peuvent améliorer cette version initiale de notre outil ou corriger d’éventuels bugs. N'oubliez pas de soumettre vos contributions via des pull-requests.

**Vous avez une idée que vous souhaitez partager avec nous pour améliorer ce projet ?** Vous avez envie de vous appuyer sur cette base pour construire un projet de pédagogie de la traçabilité numérique ? Contactez l’équipe du laboratoire CNIL par mail - ip(at)cnil.fr - ou via le compte Twitter [@LINCnil](https://twitter.com/LINCnil).

Pour de plus amples informations, voir le fichier ``LICENSE`` inclus.
