lazyBum is the new node.js framework created by [Streets Ahead LLC](http://streetsaheadllc.com).  We built lazyBum because we wanted to be able to build applications the way we wanted to build applications.  We know that every developer has their own ideas about how things should be done and this is ours.  Currently lazyBum is in a very alpha stage.  It can probably be thought more like a proof of concept than a production ready framework.  That said we believe in the development model of our little framework and we hope you check it out.  We welcome contributions so feel free to fork away.  This is primarily a weekend/evening project for us so we give it as much attention as we can but things may not always move quickly, that said feel free to provide feedback and report bugs.

To use lazyBum type 
	
	> npm install -g lazyBum
	
_Note: You are not required to use the -g option, but it may make it easier.  The -g flag installs globally, installing it this way will make sure you can always access you command line utility._ 

Once you have installed lazyBum you can get started by using our command line utility to generate a project.  Create a new directory and move into it, then use the init command shown below.
	
	> lazybum init
	
This will generate the basic folder structure for an lb project.  If you have used Rails, Grails, CodeIgniter, etc this should look relatively familiar.  The first folders you'll want to take note of are Controllers and Templates.  As implied the controllers folder will contain all your controllers and the template folder will contain your templates.  We use a custom template engine that is basically an adapted version of [Parrot](http://comments.gmane.org/gmane.comp.lang.javascript.nodejs/11826).  You can test your new project by typing `node main.js` then visit `http://localhost:8888` in your browser.

For complete docs visit [lazyBumFramework.com](http://lazyBumFramework.com).