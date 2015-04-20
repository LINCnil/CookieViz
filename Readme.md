# CookieViz (Français)
[![Issue Stats](http://issuestats.com/github/LaboCNIL/CookieViz/badge/pr)](http://issuestats.com/github/LaboCNIL/CookieViz)
[![Issue Stats](http://issuestats.com/github/LaboCNIL/CookieViz/badge/issue)](http://issuestats.com/github/LaboCNIL/CookieViz)

**CookieViz est outil de visualisation qui permet de mesurer l'impact des cookies lors de votre propre navigation.**

Concrètement, Cookieviz analyse les interactions entre votre ordinateur, votre navigateur et des sites et serveurs distants. En l'installant vous pourrez savoir à quels autres acteurs le site que vous visitez envoie des informations.

Une vidéo présentant le fonctionnement de l'outil est disponible sur Youtube à l'adresse suivante: http://www.youtube.com/watch?v=5UJGlDPRLCw.

## Installation
### Windows
Pour installer CookieViz sur Windows, vous pouvez télécharger le fichier ``setup.exe`` disponible dans la tag "RELEASE" de Github.

### Mac OS X et Linux
Pour déployer le logiciel sur Linux et sur MAC, vous devez disposer d'un serveur web, un serveur de base de données MySQL, et PHP5.

Il existe deux versions du logiciel de détection des cookies. La première version du logiciel s'appuie sur le binaire ``tshark``. La seconde s'appuie sur le binaire ``mitmdump``. Seule la version ``mitmdump`` permet de surveiller l'utilisation des cookies par des sites tiers utilisant le protocole https.

Selon la version, il sera nécessaire d'installer ``tshark`` ou ``mitmproxy``.

Il faut ensuite déplacer le répertoire cookieviz à la racine de votre serveur web.
Puis, déposer le répertoire soft dans le répertoire de votre choix.
Enfin, il est nécessaire de modifier les paramètres de connexion à la base de données dans les fichiers suivants :

 * ``cookieviz/settings.inc``
 * ``soft/monitor_tshark_osx.php``
 * ``soft/monitor_mitmdump.php``

## Utilisation
Pour lancer la surveillance de l'utilisation des cookies, il faut alors exécuter les commandes suivantes dans un terminal:

### Pour la version tshark:
``php /chemin vers le répertoire soft/monitor_tshark_osx.php <index de la carte réseau utilisée pour communiquer sur internet>``

### Pour la version mitmpdump:
``php /chemin vers le répertoire soft/monitor_mitmdump.php``

Pour la version ``mitmdump``, l'application se comporte comme un proxy. Il est donc nécessaire de paramétrer le proxy soit au niveau du navigateur, soit au niveau du système.

L'adresse du proxy est la suivante: ``localhost:8080``

Vous pouvez ensuite naviguer comme auparavant sur des sites web.
Vous pouvez constater le résultat en vous connectant avec un navigateur sur votre serveur web ``http://adresse_de_votre_serveur/cookieviz/``

## Contribuer
**CookieViz est disponible sous license GPLv3 et peut être enrichi par chacun des utilisateurs.** Les plus expérimentés peuvent améliorer cette version initiale de notre outil ou corriger d’éventuels bugs. N'oubliez pas de soumettre vos contributions via des pull-requests.

**Vous avez une idée que vous souhaitez partager avec nous pour améliorer ce projet ?** Vous avez envie de vous appuyer sur cette base pour construire un projet de pédagogie de la traçabilité numérique ? Contactez l’équipe du laboratoire CNIL par mail - ip(at)cnil.fr - ou via le compte Twitter [@CNIL](https://twitter.com/CNIL).

Pour de plus amples informations, voir le fichier ``LICENSE`` inclus.


# CookieViz (English)
[![Issue Stats](http://issuestats.com/github/LaboCNIL/CookieViz/badge/pr)](http://issuestats.com/github/LaboCNIL/CookieViz)
[![Issue Stats](http://issuestats.com/github/LaboCNIL/CookieViz/badge/issue)](http://issuestats.com/github/LaboCNIL/CookieViz)

**CookieViz is a vizualization tool allowing to weigh cookies impact during your browsing.**

Concretely, CookieViz analyzes the interactions between your computer, your web browser and the remote servers and websites. After installing it, you will be able to know to which other player the site you're visiting sends information.

A video introducing the functioning of the tool is available on YouTube : http://www.youtube.com/watch?v=5UJGlDPRLCw.

## Installation
### Windows
In order to install CookieViz on Windows, you can download the `setup.exe` file available in the "RELEASE" tag of Github.

### Mac OS X et Linux
In order to deploy the software on Linux or OS X, you need a web server, a MySQL database server and PHP5.

Two versions of the cookies detection software exist. The first relies on the `tshark` binary. The second relies on the `mitmdump` binary. Only the `mitmdump` version lets you monitor the use of cookies by third party sites that use https protocol.

According to the version, you will need to install `tshark` or `mitmproxy`.

You now need to move the cookieviz directory at the root of your webserver.
Then, move the soft directory to the place of your choice.
Finally, you have to change the database connection settings in the following files:

 * ``cookieviz/settings.inc``
 * ``soft/monitor_tshark_osx.php``
 * ``soft/monitor_mitmdump.php``

## Usage
To launch the monitor of cookies use, you have to run the following commands in a terminal:

### For the tshark version
``php /path_to_soft_directorymonitor_tshark_osx.php <index of networking device used to communicate>``

### For the mitmpdump version
``php /path_to_soft_directory/monitor_mitmdump.php``

In this version, the application behaves like a proxy. You will therefore need to set the proxy either in the browser, or in your system settings.

Proxy address is the following: `localhost:8080`

Then, you can browse like before on the internet. You can notice the results by connecting with a browser on your web server `http://your_server_address/cookieviz/`.

## Contribute
**CookieViz is available under the terms of the GPLv3 license and can be enriched by any of its users.** The most experimented can improve this initial version of our tool or correct potential bugs. Don't forget to submit your contributions *via* pull-requests.

**You have an idea you wish to share with us to improve this project ?** You want to rely on this base to build a teaching project on numerical traceability ? Contact the team of the CNIL lab by mail - ip(at)cnil.fr - or *via* the Twitter account [@CNIL](https://twitter.com/CNIL).

For more information, see the `LICENSE` file included.