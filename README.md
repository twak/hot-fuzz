# hot-fuzz
Snooper's charter fuzzer Chrome extension 

If you want to avoid various arms of the UK government viewing the websites you visit, you should probably start using a VPN from a non-UK company, and investigate the likes of TOR.

On the other hand, if are concerned that you web-history will be public if (when) your ISP (Virgin, TalkTalk, BT etc...) gets hacked, this extension gives you some deniability that you actually visited the websites that appear in their logs...by...wait for it...ensuring that all these websites already appear your logs!

What? Well if you are ever questioned on your web history, you'll be able to say "the extension visited the website, not me". Even better, if enough people use the extension, the authorities will never be able to use the list of websites you've visted as evidence, because it'll rubbish.

The goal is to let people visit websites without worrying about who will know this in the future. So people can explore political, religous, race/sexuality-related, and just plain contraversial content, without concern for big-brother. While we May trust the government today, recent events have shown that we may not wish to trust the governments of tomorrow with this information.

So this extension just makes requests to a bunch of (very shady) websites, then discards the results. It doesn't load the entire page, so any kind of deep inspection will be able to tell if you really visited the page...or not. It does this as long as your browser is open: so don't use it on metered connections etc...

Bewarned: this extension does make continuous requests to all these horrible sites, but none of the content is returned to you (blocked by Chrome's security policy).

The premise behind this extension is untested, and probably only any use against the less tech-savy authroities, instead of the big-boys like GCHQ.

I initialized the list of websites using the following...please leave suggestions for other sites as pull requests.

https://www.reddit.com/r/india/comments/3fl8y9/indian_government_bans_porn_serious_discussion/ctprt37/
https://www.wikileaks.org/wiki/Australian_government_secret_ACMA_internet_censorship_blacklist,_6_Aug_2008
