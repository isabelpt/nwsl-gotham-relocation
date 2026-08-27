# Agentic Analysis

**Project:** Gotham FC's Move to Queens: Does transit accessibility translate to attendance?
**Tool:** Claude Code (Sonnet ~95%, Opus ~4%)
**Span:** August 21 to August 26, 2026. 427 prompts from me.

This was my first time using Claude Code, so there was a learning curve. At first, I gave it too much autonomy, and I ended up scrapping everything it did and starting over, so I could more carefully scaffold the process. When I went about it the second time, I had a much more clear vision of the methods I wanted to use, and I used it to scaffold notebooks with me, ask clarifying questions (in both directions), and I got better at knowing when to question its decision making and test for potential data errors. 

Below are key exchanges that actually moved the project, organized by stage. I have included the ones where the model was right, the ones where it was wrong, and the ones where I killed work it had already done.

---

## Stage 1: Scoping and the isochrone build (Aug 21)

### The opening prompt

> **Me, 14:13:** nwsl-project is an existing project of mine analyzing nwsl and mls attendance. in-class has the methods we have learned in class. nwsl_transportation has some old code. here is the outline for nwsl_geospatial, flesh it out more, and ask clarifying questions.
> Ultimate goal: How will Gotham's move to Queens affect attendance and change accessibility [...] I want some sort of show stopping geospatial nyc visualization to show this effect

I gave it three sibling repos as context and asked for clarifying questions before any code. That made sure the model built a concrete plan and I answered with constraints (tracts not block groups, NWSL only, deadline Wednesday). Then:

> **Me, 14:32:** the plan looks good. let's implement this in pieces to make sure everything goes smoothly

"In pieces" was an instruction I gave over and over again, to make sure I can vet and understand each piece. 

### First questionable push

Twenty minutes into having isochrone results, I did not accept the design:

> **Me, 14:56:** explain what we've done so far and what it means. also why aren't we using every current nwsl stadium's transit accessibility vs focusing just on stadium moves? is this because stadium relocation is such an attendance booster? im worries about the sample size

Before a model was even built, I wanted to make sure I was accounting for the small sample size of relocations. Otherwise, none of my results would be significant.

### Catching the capacity ceiling

> **Me, 15:46:** have to consider capacity constraints. cpkc is a small stadium

> **Claude, 15:47:** Sharp catch, let me check the actual numbers, because KC's post-move average (11,500) looked suspiciously round.

It then found that Kansas City Current's post-move utilization was exactly 100.0 percent, and later (Aug 23) confirmed that **every single 2026 KC Current game reports attendance = exactly 11,500, with zero variation across nine games**. Its own summary of that:

> **Claude, Aug 23 16:25:** That's not real turnstile data, that's the stadium reporting "sold out" as a flat number instead of an actual count. [...] It's actively teaching the model "moving venues caps your attendance at a fixed number," which is backwards.

That became the capacity-censoring filter in `09_catboost_feature_engineering.ipynb` (flag any exact attendance value repeating three or more times within a team-season at or near listed capacity, drop those rows). It affects roughly 8 percent of the panel. A similar NWSL study used tobit regression to account for this, but I wanted to keep it simple since the % of rows affected was small and localized.

---

## Stage 2: The r5py walking-speed bug

The isochrones said Red Bull Arena could not reach Midtown Manhattan in 90 minutes. I know that trip. It is not 90 minutes. New Yorkers walk fast!

> **Me, 21:10:** i simply dont agree that it takes more than 90 minutes to get from red bull to midtown

Claude's first response was a plausible defense of the number:

> **Claude, 21:15:** Red Bull Arena to Harrison PATH station is **16 minutes walking**, for a straight-line distance of only 0.41 miles (normally ~8-10 min). [...] Two honest possibilities for that inflated walk segment, and I don't want to guess which without checking:
> 1. **Real pedestrian circuity** [...] this is a real, known complaint about the stadium in reality, not something I'm inventing to excuse the number.
> 2. **OSM data gap** in the clipped extract near the stadium.

Both of those are wrong. It offered me a choice between two explanations that were each individually reasonable and neither of which was the cause. If I had accepted either, the project would have shipped with every reachable-population figure understated.

> **Me, 21:16:** im still not convinced

All it took was four words and a little push back to fix. 

> **Claude, 21:18:** Confirmed the root cause, and it's bigger than just this one stadium: **r5py's default walking speed is `speed_walking=3.6 km/h`** (approximately 2.2 mph), notably slower than the ~5 km/h that Google Maps and most real-world walking estimates use. That's not specific to Red Bull Arena's location; it's the default parameter every `r5py.TransportNetwork`/`Isochrones`/`TravelTimeMatrix` call in this entire project has used, since none of our scripts ever overrode it. [...] **every reachable-population number we've generated is somewhat conservative (understated)** [...]
>
> **Your skepticism was right, and I should have checked this default before now rather than trusting it.**

Impact: Sports Illustrated Stadium's 60-minute reach went from 620K to 1.05 million once corrected. Every isochrone in the project was rebuilt. The headline 3.20M vs 1.05M number in the paper only exists in its correct form because of this.

**What I take from it:** the model verified the *route* (it correctly established that the 1,001m walked path was real geometry, not a data gap) but did not think to verify the *parameter*. It debugged one level too shallow and then presented a confident menu of wrong answers. Pushing back without giving it a hypothesis is what forced it down a level.

---

## Stage 3: Claude got too ambitious (Aug 22)

### Rejecting scope creep after and after again

Through Aug 22 and 23 my prompts are almost entirely subtraction:

> **Me, Aug 21 20:24:** take a look at the new code. i think there are way too many files, and that it is overcomplicated.
> **Me, Aug 21 20:35:** i just think there's too much code
> **Me, Aug 22 16:46:** what would be your recommendation to pare this project down to a more realistic scope? would be nice to just have 5 notebooks
> **Me, Aug 22 16:53:** I still want to keep the data pulling separate, even if it means more files. 
> **Me, Aug 23 16:49:** there's way too many models right now and code files. how can i pare this all down to be explainable in an 8 page paper

The agent's default is adding more and more. Left alone it added a Bayesian hierarchical model, an eleven-city "Plan B" isochrone expansion, three separate CV schemes, a bootstrap CI loop, k-means tract clustering with three weighting variants, and a Yankee Stadium/Citi Field comparison. I cut all of it. "Within the scope of what I can explain" was the filter, and it is the right one for a graded deliverable I have to defend out loud in six minutes.

The largest single deletion, Plan B, was work the model had built successfully and correctly:

> **Me, Aug 21 21:24:** remove the entire plan b cities, and updated the comparison cities. but first explain to my why it doesnt reach manhattan

I made it justify the finding before I let it delete the evidence because many of these tangential methods didn't actually say anything of substance

---

## Stage 4: The extrapolation bug and the two-stage split (Aug 24 to Aug 25)

### The model breaking in two different directions

> **Me, Aug 24 15:03:** is there a way to see the trees? to see how the value is being produced

Chasing the actual mechanism surfaced this:

> **Claude, Aug 24 15:02:** **The linear model doesn't just fail to generalize, it explodes.** Etihad Park's accessibility value (3.2M reachable) is far outside anything in the training data [...] 105,688 is over 4x Etihad Park's actual 25,000 capacity, which is a nonsense number, not a conservative-but-wrong one.
>
> **The tree models don't blow up, and that's the actually useful contrast.** Trees can't extrapolate past the range of values they've seen [...] But notice what they land on: both are close to Gotham's actual 2026 attendance (~10,900), not a big lift.

This one was partially my bad for not understanding why the CatBoost couldn't extrapolate at first. One model produced a massive number, and the other one produced an incredibly smaller one. 

### The worst bug was embarassingly hard to catch.

> **Claude, Aug 25 16:16:** **the single most important input to this prediction is already outside the range the model has ever seen.** Etihad Park's `metro_size` is **3,201,230**. The training data's `metro_size` column tops out at **1,464,640**. [...] CatBoost **cannot extrapolate past the range of values in training** [...] a `metro_size` value above the max training value just falls into the same terminal leaf as the biggest team it's ever seen. The model isn't capturing "this market is 2x bigger than anything we've modeled", it's silently treating it as "same as the biggest market we know". **No amount of hyperparameter tuning fixes this, it's a structural property of tree models, not a fitting problem.**

I verified this by capping `metro_size` at the training maximum and feeding the real value. Identical prediction, to the digit. A model that answers the same whether you tell it the truth or a lie is not using that input.

I had walked into that exchange asking about hyperparameters:

> **Me, Aug 25 16:15:** i want a model that makes the strongest prediction of gothams attendance. tell me what will get me there

I asked how to tune, and it told me the problem was the architecture not the tuning. 

### The fix, which was mine

> **Me, Aug 25 16:40:** I want to make a residual model (correct me if you dont think its a good idea) following these steps:
> 1. Transform the Target: `Log_Attendance = ln(Attendance)`.
> 2. Linear Component: Train your Linear Regression using `Accessibility` to predict `Log_Attendance`.
> 3. Calculate Residuals in Log Space [...]
> 4. CatBoost Component: Train CatBoost to predict these log-space residuals using your other available features.
> 5. Get Final Prediction: Add the Linear log-prediction and the CatBoost log-residual together, reverse with exp().

This is the architecture in the final version. Accessibility goes through the linear stage, where extrapolation is defensible and everything else goes through CatBoost on the residual, where it never has to extrapolate. The log transform is what keeps Etihad Park only 0.78 log-units past the training maximum instead of 2.2x past it in raw units.

### Choosing the validation scheme

> **Me, Aug 25 16:49:** i feel like i dont care about loto because the model already knows about gotham. Leave-one-venue-out sounds interesting

The model was obsessed with Leave-One-Team-Out cross validation. I repeatably questioned its use because LOTO asks "can this predict a team it has never seen," and that is not my question. LOVO is the actual question because Gotham is an established team with a new venue. 
The honest result of LOVO is in the paper: linear stage R² = -0.045, combined model R² = 0.004, against a naive 80/20 split R² of 0.788. 

---

## Stage 5: Where I rejected finished work

Three cases, all on Aug 24 and 25, where the agent completed a task correctly and I threw it out.

**1. Reverting a figure I had asked for.**
> **Me, Aug 24 01:06:** just add the shifts to the barplot
> **Me, Aug 24 01:07:** **no no no revert. just add text to say the net change**

It did exactly what I asked and the result was unreadable. 

**2. Aborting a running job.**
> **Me, Aug 25 22:02:** dont do the bootstrap. abort

I made it strip the bootstrap cells out of `11_catboost_attendance_model.ipynb`, re-ran the notebook, and verified the outputs matched the pre-bootstrap state exactly (LOVO R² = -0.008). 

**3. Reverting a whole rebuild eight minutes later.**
> **Me, Aug 25 22:10:** revert back to the old placebo, i dont like this

An entire rebuild of notebook `04` plus its downstream numbers and README section, undone. It correctly reapplied one unrelated fix (a venue rename) that predated the rebuild rather than blindly restoring the old file.

**And one where I refused vendored data:**
> **Me, Aug 24 00:08:** i dont want to use something that's not calculated in this project

The `transit_accessibility` feature turned out to be built from Etihad Park constants that were **typed in with a comment claiming they came from a real Overpass API query, with no such query anywhere in the repo**. That is a fabricated provenance comment, and it is the most serious thing the model did in this project. It surfaced it honestly when asked, but it had written it. Anything that could not be traced to a calculation in this repo came out.

---

## Stage 6: Validating the synthetic control (Aug 24)

> **Me, 16:52:** do you think that the synthetic control accurately predicts the other moves that already happened?

> **Claude:** Good question, and the honest answer is: **this wasn't actually tested**, and I should flag that as a real gap rather than something the paper glosses over. [...] the 68.8% / 103.5% / 174.3% "comparable relocation" numbers **are not synthetic-control estimates at all**, they're a much cruder calculation: each team's own raw mean attendance before vs. after its move year, no donor pool, no counterfactual, no adjustment for the league-wide attendance trend those teams would have ridden anyway.

This led to real placebo tests on Washington Spirit and Seattle Reign (San Diego is not testable: a 2022 expansion team has one pre-move season, so the weight fit is trivially perfect and meaningless).

Then I asked:

> **Me, 17:15:** ok so we are sure this is scientifically sound

> **Claude:** Not unqualified "yes". [...] **The placebo fits are closer to exactly-determined than genuinely validated.** Each placebo uses 4 donor teams over a 4-year pre-period. With weights constrained to sum to 1, that's 3 free parameters being fit to 4 data points, almost no slack. [...] **The two placebo tests aren't independent.** Seattle's and Washington Spirit's placebos use the identical 4-team donor pool. [...] **No formal statistical inference anywhere in this chain.** [...] **San Diego's "corrected" lift is a guess, not a measurement.**

Every one of those four caveats is now in the paper's Discussion. They exist because I asked a yes/no question that invited a "yes" and got four reasons why not.

---

## Stage 7: Writing and defending (Aug 25 to Aug 26)

In this stage, I wanted to make sure I could understand and defend every choice and model I made. Anything I couldn't was removed.

> **Me, Aug 24 00:32:** why is the model run with these values: `CatBoostRegressor(iterations=1000, learning_rate=0.1, depth=6, verbose=200)`
> **Me, Aug 24 00:34:** so what can i say about these values if im asked about them
> **Me, Aug 26 13:35:** there are three main things i need you to explain to me. how does the synthetic control equation work, what do those catboost parameters mean, and how does the dual model structure work
> **Me, Aug 26 13:47:** how can i explain this in one minute to other people

And I kept auditing numbers:

> **Me, Aug 26 12:59:** why is kansas city's so big? it feels hard to believe only 6000 people lived within an hour before they moved.

The model's response is a good model of what I wanted from it all week. It did not defend the number and it did not immediately concede it:

> **Claude:** Genuinely suspicious number, worth checking rather than defending. [...] **Verified, and the number is real.** Exactly one bus route serves Children's Mercy Park on Saturdays. RideKC route 101, running roughly hourly [...] I ruled out the three things that could have made this an artifact: **Missing geography?** No. **Missing GTFS?** No, the KCATA feed has stops 188m from the stadium. **Missing OSM?** No. [...] **The caveat worth knowing:** this makes the +1,953.9% unusually fragile [...] with a single hourly route, whether a connection is caught is close to binary, so a departure time 20 minutes earlier could move the number substantially.

Confirmed the number, then volunteered the reason not to trust it too much. That footnote is in the paper.
---

## What actually worked

| Technique | Why it worked |
|---|---|
| **"I'm not convinced," with no hypothesis attached** | Forced the model to search instead of confirm. Found the walking-speed bug. If I had guessed a cause, it would have evaluated my guess. |
| **Building in pieces** | Every phase produced something rejectable before it propagated downstream. |
| **Asking "what can I say if I'm asked about this"** | Different question from "explain this," and a much better test of whether I actually own the work. |
| **Refusing anything not computed in-repo** | Caught a hardcoded constant with a fabricated provenance comment. |
| **Making it justify work before deleting it** | "Explain to me why it doesn't reach Manhattan" before "remove Plan B." The reasoning is preserved even though the code is gone. |
| **Asking about sample size on day one** | The constraint that shaped the paper was identified before any model existed. |

## Where the model failed

1. **Trusted library defaults without checking them.** `speed_walking=3.6` was in every call in the project for a full day.
2. **Offered a confident menu of wrong explanations.** Both of its walking-speed hypotheses were wrong, and both were plausible enough to accept.
3. **Wrote a provenance comment for data it had not computed.** The Etihad Overpass constants. This is the one I would flag hardest to anyone else using these tools.
4. **Defaulted to the textbook method over the right one.** LOTO instead of LOVO.
5. **Accreted complexity relentlessly.** PyMC, eleven extra metros, three CV schemes, four figure variants. Every one was competently built and none of them belonged.
6. **Described raw pre/post differences as synthetic-control validation** until directly asked whether the method had been tested.
7. **Carried a wrong fact (2028 vs 2027) for six days** because it was never a computed value, only an assumption.

## What I'd do differently

I should have audited every assumption and method before implementing it because most of these examples involve having to backtrack from a choice made not by me. 
That being said, every time I had a concern, the model was good at verifying it as long as I pushed it enough. It just rarely initiated that rigorous of verification on its own. The verification is the main step I couldn't and shouldn't automate, and it required a strong understanding of the field and existing methods in the literature.
